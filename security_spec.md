# Security Specification

## 1. Data Invariants
- Each user profile document is keyed by Firebase Auth UID: `/users/{userId}`.
- A user can only read and write their own profile document (`request.auth.uid == userId`).
- History documents reside in subcollection `/users/{userId}/history/{historyId}`. Access strictly requires `request.auth.uid == userId`.
- User ID and History ID must be valid alphanumeric identifier strings (max length 128).
- Users cannot escalate privileges (self-assign `role: 'admin'`). Roles can only be assigned by administrators or default to `'user'`.
- Timestamps and required properties must be strictly validated.

## 2. The "Dirty Dozen" Threat Payloads
1. **Unauthenticated Profile Read**: Anonymous request to read `/users/{victimUid}` -> MUST BE REJECTED.
2. **Cross-User Profile Read**: Authenticated User A attempting to read `/users/{userB}` -> MUST BE REJECTED.
3. **Cross-User Profile Write**: Authenticated User A attempting to write `/users/{userB}` -> MUST BE REJECTED.
4. **Privilege Escalation on Register**: User registering with `role: "admin"` -> MUST BE REJECTED.
5. **Path Poisoning**: Document ID with junk characters or length > 128 -> MUST BE REJECTED.
6. **Cross-User History Hijacking**: User A attempting to write history record into User B's `/users/{userB}/history/{histId}` -> MUST BE REJECTED.
7. **Foreign History Listing**: User A attempting to query User B's history subcollection -> MUST BE REJECTED.
8. **Shadow Field Injection**: Writing user document with arbitrary undeclared payload fields -> MUST BE REJECTED.
9. **Admin Email Spoofing Without Verification**: Request claiming admin email with `email_verified == false` -> MUST BE REJECTED.
10. **History Item Owner Tampering**: Writing history item with `userId` mismatching `request.auth.uid` -> MUST BE REJECTED.
11. **Negative Counters / Invalid Field Types**: Setting `filesProcessed: "invalid_type"` or huge strings -> MUST BE REJECTED.
12. **Catch-All Wildcard Exploit**: Accessing arbitrary collections outside schema -> MUST BE REJECTED.
