export type Language = 'en' | 'hi';

export interface Translations {
  nav: {
    home: string;
    pdfTools: string;
    howItWorks: string;
    pricing: string;
    faq: string;
    login: string;
    getStarted: string;
    toolsQuick: string;
    accountDetails: string;
    converted: string;
    storage: string;
    userDashboard: string;
    fileHistory: string;
    adminPanel: string;
    firebaseConfig: string;
    signOut: string;
    signInToAccount: string;
    signIn: string;
    register: string;
    pdfToolsDirectory: string;
    viewAll: string;
    tagline: string;
  };
  hero: {
    startWithImage: string;
    dropJpgTitle: string;
    rightHere: string;
    subtitle: string;
    browseFiles: string;
    dragAndDrop: string;
    orClickToBrowse: string;
    supportsImages: string;
    toolsLabel: string;
    sampleFiles: string;
    sampleInvoice: string;
    sampleReceipt: string;
    samplePhoto: string;
    quickTools: {
      jpgToPdf: string;
      mergePdf: string;
      compressPdf: string;
      splitPdf: string;
      pdfToJpg: string;
      rotatePdf: string;
      protectPdf: string;
      watermark: string;
    };
  };
  toolGrid: {
    title: string;
    subtitle: string;
    allToolsTitle: string;
    allToolsSubtitle: string;
    categories: {
      all: string;
      convert: string;
      organize: string;
      security: string;
    };
    searchPlaceholder: string;
    openTool: string;
    noToolsFound: string;
  };
  tools: {
    jpgToPdf: {
      title: string;
      desc: string;
    };
    mergePdf: {
      title: string;
      desc: string;
    };
    splitPdf: {
      title: string;
      desc: string;
    };
    compressPdf: {
      title: string;
      desc: string;
    };
    pdfToJpg: {
      title: string;
      desc: string;
    };
    rotatePdf: {
      title: string;
      desc: string;
    };
    watermarkPdf: {
      title: string;
      desc: string;
    };
    protectPdf: {
      title: string;
      desc: string;
    };
    inspectPdf: {
      title: string;
      desc: string;
    };
    wordToPdf: {
      title: string;
      desc: string;
    };
  };
  howItWorks: {
    tagline: string;
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  faq: {
    tagline: string;
    title: string;
    subtitle: string;
    items: Array<{ q: string; a: string }>;
  };
  pricing: {
    title: string;
    subtitle: string;
    starter: {
      name: string;
      desc: string;
      period: string;
      cta: string;
      features: string[];
    };
    pro: {
      name: string;
      desc: string;
      period: string;
      cta: string;
      features: string[];
    };
    enterprise: {
      name: string;
      desc: string;
      period: string;
      cta: string;
      features: string[];
    };
  };
  footer: {
    tagline: string;
    tools: string;
    pricing: string;
    about: string;
    admin: string;
    copyright: string;
    createdBy: string;
  };
  auth: {
    signInTitle: string;
    registerTitle: string;
    adminTitle: string;
    fullName: string;
    emailAddress: string;
    password: string;
    confirmPassword: string;
    signInBtn: string;
    registerBtn: string;
    adminLoginBtn: string;
    continueWithGoogle: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    registerHere: string;
    signInHere: string;
    adminNotice: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: 'Home',
      pdfTools: 'PDF Tools',
      howItWorks: 'How it works',
      pricing: 'Pricing',
      faq: 'FAQ',
      login: 'Log in',
      getStarted: 'Get started',
      toolsQuick: 'Tools',
      accountDetails: 'Account Details',
      converted: 'CONVERTED',
      storage: 'STORAGE',
      userDashboard: 'User Dashboard',
      fileHistory: 'File History',
      adminPanel: 'Admin Control Panel',
      firebaseConfig: 'Firebase Configuration',
      signOut: 'Sign out',
      signInToAccount: 'Sign in to your MAKEPDF account',
      signIn: 'Sign In',
      register: 'Register',
      pdfToolsDirectory: 'PDF Tools Directory',
      viewAll: 'View all →',
      tagline: 'Simple PDF tools',
    },
    hero: {
      startWithImage: 'START WITH AN IMAGE',
      dropJpgTitle: 'Drop your JPG',
      rightHere: 'right here.',
      subtitle: 'Browse files from your device and turn JPG or PNG images into polished PDFs.',
      browseFiles: 'Browse Files',
      dragAndDrop: 'Drag and drop your images here',
      orClickToBrowse: 'or click to browse from device',
      supportsImages: 'Supports JPG, PNG, WEBP • Fast Client-Side Processing',
      toolsLabel: 'TOOLS:',
      sampleFiles: 'Quick Test Samples:',
      sampleInvoice: 'Invoice Demo',
      sampleReceipt: 'Receipt Demo',
      samplePhoto: 'Photo Sample',
      quickTools: {
        jpgToPdf: 'JPG to PDF',
        mergePdf: 'Merge PDF',
        compressPdf: 'Compress PDF',
        splitPdf: 'Split PDF',
        pdfToJpg: 'PDF to JPG',
        rotatePdf: 'Rotate PDF',
        protectPdf: 'Protect PDF',
        watermark: 'Watermark',
      },
    },
    toolGrid: {
      title: 'All-in-One PDF Toolset',
      subtitle: 'Choose an ultra-fast utility below to convert, manipulate, or optimize your PDF documents.',
      allToolsTitle: 'All PDF Tools Directory',
      allToolsSubtitle: 'Access our complete suite of 9 high-performance document utilities below.',
      categories: {
        all: 'All Tools',
        convert: 'Convert',
        organize: 'Organize',
        security: 'Security & Utility',
      },
      searchPlaceholder: 'Search PDF tools (e.g. merge, compress, protect)...',
      openTool: 'Open Tool',
      noToolsFound: 'No tools found matching your search.',
    },
    tools: {
      jpgToPdf: {
        title: 'JPG to PDF',
        desc: 'Bulk upload and queue multiple images (JPG, PNG, WebP) for batch conversion into a single PDF.',
      },
      mergePdf: {
        title: 'Merge PDF',
        desc: 'Combine multiple PDF files into one continuous document in your exact desired order.',
      },
      splitPdf: {
        title: 'Split PDF',
        desc: 'Extract specific pages or custom page ranges (e.g. 1-3, 4-7) into distinct PDF files.',
      },
      compressPdf: {
        title: 'Compress PDF',
        desc: 'Reduce PDF file size significantly while preserving crisp text, layout and imagery.',
      },
      pdfToJpg: {
        title: 'PDF to JPG',
        desc: 'Extract every page of your PDF into high-resolution JPG or PNG image files in seconds.',
      },
      rotatePdf: {
        title: 'Rotate PDF',
        desc: 'Rotate misoriented PDF pages by 90°, 180°, or 270° clockwise or counter-clockwise.',
      },
      watermarkPdf: {
        title: 'Watermark PDF',
        desc: 'Stamp custom confidentiality texts, logos, or copyright notices onto PDF pages.',
      },
      protectPdf: {
        title: 'Protect PDF',
        desc: 'Encrypt and lock your PDF document with a robust security password to restrict access.',
      },
      inspectPdf: {
        title: 'PDF Inspector',
        desc: 'Inspect technical PDF metadata, page count, fonts, structure, and security profile.',
      },
      wordToPdf: {
        title: 'Word to PDF',
        desc: 'Convert DOC and DOCX Word documents into clean, professional PDF files directly in your browser.',
      },
    },
    howItWorks: {
      tagline: 'THREE STEPS TO PERFECTION',
      title: 'How MAKEPDF Works',
      subtitle: 'Designed for speed. No complicated registration forms, no watermarks, no server queues.',
      step1Title: 'Drop or select your files',
      step1Desc: 'Drag JPG, PNG, or PDF files into the dropzone. Instant client-side inspection with zero upload waiting.',
      step2Title: 'Configure layout & order',
      step2Desc: 'Rearrange pages, pick orientations (Portrait/Landscape), adjust margins, or apply custom watermarks.',
      step3Title: 'Generate & download',
      step3Desc: 'Your PDF is compiled with pure vector clarity in milliseconds. Download straight to your computer.',
    },
    faq: {
      tagline: 'GOT QUESTIONS?',
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about MAKEPDF conversion speeds, formats, and data privacy.',
      items: [
        {
          q: 'Are my uploaded files and images safe on MAKEPDF?',
          a: 'Yes, 100%. All image conversions and PDF transformations run directly inside your browser memory or ephemeral temporary storage. We never store, sell, or inspect your personal documents.',
        },
        {
          q: 'Can I reorder or delete pages before saving?',
          a: 'Absolutely! When converting JPG to PDF or merging documents, you can freely rearrange files with move up/down controls, delete unneeded images, and choose between A4, Letter, or Original dimensions.',
        },
        {
          q: 'Is there a limit on how many images I can convert into a single PDF?',
          a: 'Free community users can convert dozens of images (up to 50 MB total batch size) at once with zero cost and no forced watermarks.',
        },
        {
          q: 'What formats are supported by MAKEPDF?',
          a: 'We support JPG, JPEG, PNG, and WebP for image conversion, plus native PDF manipulation for merge, split, compress, rotate, and watermark operations.',
        },
        {
          q: 'Can I use MAKEPDF on mobile devices or tablets?',
          a: 'Yes! The responsive interface is fully optimized for touch devices, allowing you to convert photos straight from your camera roll into PDFs on iOS and Android.',
        },
        {
          q: 'How do I download and install the mobile app safely with zero harmful warnings?',
          a: 'MAKEPDF is an official, verified Progressive Web App (PWA). Unlike raw APKs or HTML downloads that trigger "File might be harmful" warnings, MAKEPDF installs directly and safely to your phone home screen with 0 warnings. On Android Chrome: Tap Menu (⋮) > "Install app" (or "Add to Home screen"). On iPhone Safari: Tap Share (⬆️) > "Add to Home Screen".',
        },
      ],
    },
    pricing: {
      title: 'Simple, Transparent Pricing',
      subtitle: 'Start free for life or unlock high-capacity pro tools for your team.',
      starter: {
        name: 'Starter Community',
        desc: 'For students and casual document handling',
        period: 'forever free',
        cta: 'Start Free',
        features: [
          'All 9 Essential PDF Tools included',
          'Process up to 25 MB files',
          'Standard conversion speed',
          'Zero file retention / 100% Client-Side Privacy',
          'No signup required for basic tools',
        ],
      },
      pro: {
        name: 'Professional',
        desc: 'For legal professionals, accountants & creators',
        period: 'per month',
        cta: 'Upgrade to Pro',
        features: [
          'Unlimited document conversions',
          'High-capacity 250 MB file limits',
          'Turbo OCR & vector font preservation',
          'Batch processing (up to 100 files simultaneously)',
          'Cloud sync & audit history (30 days)',
          'Priority email & developer support',
        ],
      },
      enterprise: {
        name: 'Enterprise Organization',
        desc: 'For engineering teams and high-volume pipelines',
        period: 'per month / billed annually',
        cta: 'Contact Sales',
        features: [
          'Dedicated Python Flask API microservice',
          'Unlimited concurrency & workers',
          'Custom watermark & brand stamping presets',
          'Single Sign-On (SSO) & SAML integration',
          'Self-hosted deployment docker containers',
          '99.99% Uptime Service Level Agreement',
        ],
      },
    },
    footer: {
      tagline: 'Powerful PDF Tools. Made Simple.',
      tools: 'PDF Tools',
      pricing: 'Pricing',
      about: 'About',
      admin: 'Admin Panel',
      copyright: '© 2026 MAKEPDF. All rights reserved.',
      createdBy: 'Created by',
    },
    auth: {
      signInTitle: 'Welcome back to MAKEPDF',
      registerTitle: 'Create your MAKEPDF account',
      adminTitle: 'Admin Portal Login',
      fullName: 'Full Name',
      emailAddress: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      signInBtn: 'Sign In to Account',
      registerBtn: 'Create Account',
      adminLoginBtn: 'Access Admin Panel',
      continueWithGoogle: 'Continue with Google',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      registerHere: 'Register here',
      signInHere: 'Sign in here',
      adminNotice: 'Secure credentials required for administrator access.',
    },
  },
  hi: {
    nav: {
      home: 'होम',
      pdfTools: 'PDF टूल्स',
      howItWorks: 'यह कैसे काम करता है',
      pricing: 'मूल्य (Pricing)',
      faq: 'अक्सर पूछे जाने वाले सवाल',
      login: 'लॉग इन',
      getStarted: 'शुरू करें',
      toolsQuick: 'टूल्स',
      accountDetails: 'खाता विवरण',
      converted: 'कन्वर्टेड',
      storage: 'स्टोरेज',
      userDashboard: 'यूज़र डैशबोर्ड',
      fileHistory: 'फ़ाइल इतिहास',
      adminPanel: 'एडमिन कंट्रोल पैनल',
      firebaseConfig: 'फ़ायरबेस कॉन्फ़िगरेशन',
      signOut: 'लॉग आउट',
      signInToAccount: 'अपने MAKEPDF खाते में साइन इन करें',
      signIn: 'साइन इन',
      register: 'रजिस्टर करें',
      pdfToolsDirectory: 'PDF टूल्स डायरेक्टरी',
      viewAll: 'सभी देखें →',
      tagline: 'सरल एवं शक्तिशाली PDF टूल्स',
    },
    hero: {
      startWithImage: 'इमेज से शुरुआत करें',
      dropJpgTitle: 'अपनी JPG फाइलें',
      rightHere: 'यहाँ ड्रॉप करें।',
      subtitle: 'अपनी डिवाइस से इमेज चुनें और JPG या PNG को शानदार PDF में बदलें।',
      browseFiles: 'फ़ाइलें चुनें',
      dragAndDrop: 'अपनी इमेज यहाँ खींचें और छोड़ें',
      orClickToBrowse: 'या डिवाइस से चुनने के लिए क्लिक करें',
      supportsImages: 'JPG, PNG, WEBP समर्थित • तेज़ और सुरक्षित ब्राउज़र प्रोसेसिंग',
      toolsLabel: 'टूल्स:',
      sampleFiles: 'त्वरित टेस्ट नमूने:',
      sampleInvoice: 'बिल नमूना',
      sampleReceipt: 'रसीद नमूना',
      samplePhoto: 'फ़ोटो नमूना',
      quickTools: {
        jpgToPdf: 'JPG से PDF',
        mergePdf: 'मर्ज PDF',
        compressPdf: 'कंप्रेस PDF',
        splitPdf: 'स्प्लिट PDF',
        pdfToJpg: 'PDF से JPG',
        rotatePdf: 'रोटेट PDF',
        protectPdf: 'पासवर्ड सुरक्षा',
        watermark: 'वाटरमार्क',
      },
    },
    toolGrid: {
      title: 'ऑल-इन-वन PDF टूलकिट',
      subtitle: 'अपनी PDF फाइलों को तेज़ी से बदलने, व्यवस्थित करने या सुरक्षित करने के लिए नीचे दिए गए टूल का उपयोग करें।',
      allToolsTitle: 'सभी PDF टूल्स डायरेक्टरी',
      allToolsSubtitle: 'नीचे हमारे सभी 9 शक्तिशाली और तेज़ डॉक्यूमेंट टूल्स उपलब्ध हैं।',
      categories: {
        all: 'सभी टूल्स',
        convert: 'कन्वर्ट (बदलें)',
        organize: 'व्यवस्थित करें',
        security: 'सुरक्षा और उपयोगिता',
      },
      searchPlaceholder: 'PDF टूल खोजें (जैसे: मर्ज, कंप्रेस, लॉक)...',
      openTool: 'टूल खोलें',
      noToolsFound: 'आपकी खोज से मिलता-जुलता कोई टूल नहीं मिला।',
    },
    tools: {
      jpgToPdf: {
        title: 'JPG से PDF',
        desc: 'फ़ोटो को बल्क में अपलोड और कतारबद्ध करें और एक साथ बैच में PDF बनाएं।',
      },
      mergePdf: {
        title: 'मर्ज PDF',
        desc: 'कई PDF फाइलों को अपनी इच्छानुसार क्रम में जोड़कर एक बनाएं।',
      },
      splitPdf: {
        title: 'स्प्लिट PDF',
        desc: 'PDF से खास पेज या पेज रेंज अलग करके नई फाइलें बनाएं।',
      },
      compressPdf: {
        title: 'कंप्रेस PDF',
        desc: 'PDF की गुणवत्ता बनाए रखते हुए उसका साइज काफी कम करें।',
      },
      pdfToJpg: {
        title: 'PDF से JPG',
        desc: 'PDF के सभी पेजों को हाई-रिज़ॉल्यूशन JPG इमेज में निकालें।',
      },
      rotatePdf: {
        title: 'रोटेट PDF',
        desc: 'तिरछे या उल्टे PDF पेजों को 90°, 180° या 270° सही दिशा में घुमाएं।',
      },
      watermarkPdf: {
        title: 'वाटरमार्क जोड़ें',
        desc: 'PDF पेजों पर अपना नाम, कंपनी का नाम या लोगो स्टैम्प करें।',
      },
      protectPdf: {
        title: 'पासवर्ड सुरक्षा',
        desc: 'मजबूत पासवर्ड जोड़कर अपनी संवेदनशील PDF फाइलों को लॉक करें।',
      },
      inspectPdf: {
        title: 'PDF इंस्पेक्टर',
        desc: 'PDF की आंतरिक जानकारी, मेटाडेटा, पेज संख्या और सुरक्षा जांचें।',
      },
      wordToPdf: {
        title: 'Word to PDF',
        desc: 'DOC और DOCX वर्ड फ़ाइलों को तुरंत साफ़ और स्पष्ट PDF में बदलें।',
      },
    },
    howItWorks: {
      tagline: 'तीन सरल चरण',
      title: 'MAKEPDF कैसे काम करता है',
      subtitle: 'तेज़ गति के लिए डिज़ाइन किया गया। कोई लंबी औपचारिकता नहीं, कोई वाटरमार्क नहीं, कोई इंतज़ार नहीं।',
      step1Title: 'अपनी फ़ाइलें चुनें या छोड़ें',
      step1Desc: 'JPG, PNG या PDF फाइलें अपलोड क्षेत्र में डालें। आपकी डिवाइस में ही तुरंत प्रोसेसिंग शुरू होती है।',
      step2Title: 'लेआउट और क्रम सेट करें',
      step2Desc: 'पेजों का क्रम बदलें, ओरिएंटेशन चुनें (पोर्ट्रेट/लैंडस्केप), या वाटरमार्क जोड़ें।',
      step3Title: 'बनाएं और डाउनलोड करें',
      step3Desc: 'आपकी PDF मिलीसेकंड में तैयार हो जाती है। तुरंत अपने फोन या कंप्यूटर पर डाउनलोड करें।',
    },
    faq: {
      tagline: 'कोई सवाल है?',
      title: 'अक्सर पूछे जाने वाले सवाल',
      subtitle: 'MAKEPDF की गति, प्रारूप और डेटा सुरक्षा के बारे में सब कुछ जानें।',
      items: [
        {
          q: 'क्या MAKEPDF पर मेरी अपलोड की गई फाइलें सुरक्षित हैं?',
          a: 'हाँ, 100% सुरक्षित हैं! सभी इमेज कन्वर्ज़न और PDF कार्य सीधे आपके ब्राउज़र में होते हैं। हम आपकी फाइलों को कभी भी सेव या किसी के साथ साझा नहीं करते।',
        },
        {
          q: 'क्या मैं सेव करने से पहले पेजों को आगे-पीछे या डिलीट कर सकता हूँ?',
          a: 'बिल्कुल! JPG से PDF बदलते समय या फाइलों को जोड़ते समय आप आसानी से क्रम बदल सकते हैं या गैर-ज़रूरी पेज हटा सकते हैं।',
        },
        {
          q: 'एक साथ कितनी इमेज को PDF में बदला जा सकता है?',
          a: 'आप एक साथ दर्जनों इमेज (50 MB तक) बिना किसी शुल्क और बिना किसी वाटरमार्क के बदल सकते हैं।',
        },
        {
          q: 'MAKEPDF कौन से फॉर्मेट सपोर्ट करता है?',
          a: 'हम JPG, JPEG, PNG और WebP इमेज सपोर्ट करते हैं, साथ ही सभी प्रकार की PDF फाइलों के लिए टूल्स उपलब्ध हैं।',
        },
        {
          q: 'क्या मैं मोबाइल या टैबलेट पर MAKEPDF का उपयोग कर सकता हूँ?',
          a: 'हाँ! हमारी वेबसाइट मोबाइल और टैबलेट के लिए पूरी तरह अनुकूलित है। आप अपने फोन कैमरे से ली गई फोटो को भी सीधे PDF बना सकते हैं।',
        },
        {
          q: 'मोबाइल पर ऐप को बिना किसी खतरे (Harmful Warning) के सुरक्षित कैसे इंस्टॉल करें?',
          a: 'MAKEPDF एक आधिकारिक और 100% सुरक्षित Progressive Web App (PWA) है। खतरनाक APK या HTML फाइलों की तरह इसमें फोन में कोई "Harmful file" चेतावनी नहीं आती। इसे सुरक्षित रूप से अपने फोन में जोड़ने के लिए Chrome में ऊपर 3 डॉट्स (⋮) पर टैप करके "Install app" या "Add to Home screen" चुनें, या नीचे "Install App" बटन दबाएं।',
        },
      ],
    },
    pricing: {
      title: 'सरल और पारदर्शी मूल्य',
      subtitle: 'हमेशा के लिए मुफ़्त में उपयोग करें या प्रो सुविधाओं का लाभ उठाएं।',
      starter: {
        name: 'स्टार्टर कम्युनिटी',
        desc: 'छात्रों और आम उपयोग के लिए',
        period: 'हमेशा के लिए मुफ़्त',
        cta: 'मुफ़्त शुरू करें',
        features: [
          'सभी 9 आवश्यक PDF टूल्स शामिल',
          '25 MB तक की फ़ाइल साइज',
          'मानक प्रोसेसिंग गति',
          '100% निजी और सुरक्षित ब्राउज़र प्रोसेसिंग',
          'मूल टूल्स के लिए किसी साइनअप की आवश्यकता नहीं',
        ],
      },
      pro: {
        name: 'प्रोफेशनल',
        desc: 'वकीलों, सीए और प्रोफेशनल्स के लिए',
        period: 'प्रति माह',
        cta: 'प्रो में अपग्रेड करें',
        features: [
          'असीमित डॉक्यूमेंट कन्वर्ज़न',
          '250 MB तक बड़ी फाइलों का समर्थन',
          'फास्ट ओसीआर और वेक्टर फॉन्ट सुरक्षा',
          'बैच प्रोसेसिंग (एक साथ 100 फाइलें)',
          'क्लाउड सिंक और 30 दिनों का इतिहास',
          'प्राथमिकता सहायता (Priority Support)',
        ],
      },
      enterprise: {
        name: 'एंटरप्राइज संगठन',
        desc: 'कंपनियों और उच्च-मात्रा वाले कार्यों के लिए',
        period: 'प्रति माह / वार्षिक भुगतान',
        cta: 'संपर्क करें',
        features: [
          'समर्पित पायथन फ्लास्क एपीआई सेवा',
          'असीमित क्षमता और वर्कर्स',
          'कस्टम ब्रांडिंग और वाटरमार्क प्रीसेट',
          'सिंगल साइन-ऑन (SSO) एकीकरण',
          'सेल्फ-होस्टेड डॉकर कंटेनर विकल्प',
          '99.99% अपटाइम गारंटी',
        ],
      },
    },
    footer: {
      tagline: 'सरल एवं शक्तिशाली PDF टूल्स।',
      tools: 'PDF टूल्स',
      pricing: 'मूल्य',
      about: 'हमारे बारे में',
      admin: 'एडमिन पैनल',
      copyright: '© 2026 MAKEPDF. सर्वाधिकार सुरक्षित।',
      createdBy: 'निर्माता:',
    },
    auth: {
      signInTitle: 'MAKEPDF में पुनः स्वागत है',
      registerTitle: 'अपना नया MAKEPDF खाता बनाएं',
      adminTitle: 'एडमिन पोर्टल लॉगिन',
      fullName: 'पूरा नाम',
      emailAddress: 'ईमेल पता',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      signInBtn: 'खाते में साइन इन करें',
      registerBtn: 'नया खाता बनाएं',
      adminLoginBtn: 'एडमिन पैनल खोलें',
      continueWithGoogle: 'Google के साथ जारी रखें',
      dontHaveAccount: 'क्या आपके पास खाता नहीं है?',
      alreadyHaveAccount: 'क्या पहले से खाता मौजूद है?',
      registerHere: 'यहाँ रजिस्टर करें',
      signInHere: 'यहाँ साइन इन करें',
      adminNotice: 'एडमिनिस्ट्रेटर पहुंच के लिए सुरक्षित क्रेडेंशियल आवश्यक हैं।',
    },
  },
};
