// Define the type for the translations object
export type TranslationType = {
  [language: string]: {
    nav: {
      home: string;
      browse: string;
      mapView: string;
      login: string;
      register: string;
      profile: string;
      favorites: string;
      notifications: string;
    };
    common: {
      backToHome: string;
      loading: string;
      error: string;
      success: string;
      submit: string;
      cancel: string;
      save: string;
      delete: string;
      edit: string;
      view: string;
      search: string;
      filter: string;
      sort: string;
      more: string;
      less: string;
    };
    auth: {
      login: {
        [key: string]: string;
      };
      register: {
        [key: string]: string;
      };
      forgotPassword: {
        [key: string]: string;
      };
      resetPassword: {
        [key: string]: string;
      };
    };
    [key: string]: any;
  };
};

export const translations: TranslationType = {
  en: {
    nav: {
      home: 'Home',
      browse: 'Browse',
      mapView: 'Map View',
      login: 'LOGIN',
      register: 'REGISTER',
      profile: 'Profile',
      favorites: 'Favorites',
      notifications: 'Notifications'
    },
    common: {
      backToHome: 'Back to Home',
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      more: 'More',
      less: 'Less'
    },
    auth: {
      login: {
        title: 'Welcome back',
        subtitle: 'Please sign in to your account',
        email: 'Email address',
        password: 'Password',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        signIn: 'Sign in',
        signingIn: 'Signing in...',
        noAccount: 'Don\'t have an account?',
        signUp: 'Sign up',
        orContinueWith: 'Or continue with',
        register: 'Register now',
        errorTitle: 'Login failed',
        errorMessage: 'Incorrect email or password'
      },
      register: {
        title: 'Create an account',
        subtitle: 'Sign up to get started',
        name: 'Full name',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email address',
        phone: 'Phone Number',
        password: 'Password',
        confirmPassword: 'Confirm password',
        userType: 'I am a',
        tenant: 'Tenant',
        landlord: 'Landlord',
        agreeTerms: 'I agree to the terms and conditions',
        terms: 'Terms and Conditions',
        orContinueWith: 'Or continue with',
        signUp: 'Sign up',
        creating: 'Creating account...',
        create: 'Create Account',
        haveAccount: 'Already have an account?',
        signIn: 'Sign in',
        errorTitle: 'Registration failed',
        errorMessage: 'There was a problem creating your account'
      },
      forgotPassword: {
        title: 'Forgot password',
        subtitle: 'We\'ll send you a link to reset your password',
        email: 'Email address',
        submit: 'Send reset link',
        backToLogin: 'Back to login',
        successTitle: 'Check your email',
        successMessage: 'If an account exists with that email, you\'ll receive a password reset link'
      },
      resetPassword: {
        title: 'Reset password',
        subtitle: 'Enter your new password',
        password: 'New password',
        confirmPassword: 'Confirm new password',
        submit: 'Reset password',
        successTitle: 'Password reset successful',
        successMessage: 'Your password has been reset successfully'
      }
    },
    hero: {
      title: 'Find Your Perfect Home in Tanzania',
      subtitle: 'Search thousands of verified rental properties',
      location: 'Location',
      priceRange: 'Price Range',
      rooms: 'Rooms',
      search: 'Search Properties',
      advanced: 'Advanced Search'
    },
    browse: {
      title: 'Browse Properties',
      subtitle: 'Find your next home from our curated listings',
      search: {
        title: 'Search Properties',
        location: 'Location, neighborhood, or address',
        locationPlaceholder: 'Enter area or city...',
        propertyType: 'Property Type',
        propertyTypes: {
          all: 'All Types',
          apartment: 'Apartment',
          house: 'House',
          villa: 'Villa',
          studio: 'Studio',
          penthouse: 'Penthouse',
          duplex: 'Duplex'
        },
        priceRange: 'Price Range',
        priceRanges: {
          all: 'All Prices',
          under200k: 'Under 200,000 TZS',
          under300k: '200,000 - 300,000 TZS',
          under500k: '300,000 - 500,000 TZS',
          above500k: 'Above 500,000 TZS'
        },
        filters: {
          title: 'Filters',
          bedrooms: 'Bedrooms',
          bathrooms: 'Bathrooms',
          amenities: 'Amenities',
          priceRange: 'Price Range',
          furnished: 'Furnished',
          parking: 'Parking Available',
          pets: 'Pets Allowed',
          security: '24/7 Security',
          apply: 'Apply Filters',
          clear: 'Clear All'
        },
        searchButton: 'Search Now',
        moreFilters: 'More Filters',
        hideFilters: 'Hide Filters',
        noResults: 'No properties found matching your criteria'
      },
      results: {
        showing: 'Showing',
        properties: 'properties',
        sortBy: 'Sort by:',
        sortOptions: {
          newest: 'Newest First',
          priceAsc: 'Price (Low to High)',
          priceDesc: 'Price (High to Low)',
          popular: 'Most Popular',
          recommended: 'Recommended'
        }
      }
    },
    features: {
      title: 'Why Choose GazaRenter',
      subtitle: 'We make finding your perfect home easy and secure',
      learnMore: 'Learn More',
      exploreMore: 'Explore All Features',
      verified: {
        title: 'Verified Listings',
        description: 'All properties are thoroughly verified for quality and authenticity'
      },
      secure: {
        title: 'Secure Payments',
        description: 'Safe and secure payment processing with multiple payment options'
      },
      support: {
        title: '24/7 Support',
        description: 'Our dedicated team is always available to assist you'
      }
    },
    featured: {
      title: 'Featured Rentals',
      subtitle: 'Find homes that match your lifestyle'
    },
    trust: {
      title: 'Why Trust GazaRenter?',
      subtitle: 'We pride ourselves on maintaining the highest standards in the rental industry',
      verified: {
        title: 'Verified Properties',
        description: 'All our properties are thoroughly verified to ensure quality and authenticity'
      },
      secure: {
        title: 'Secure Payments',
        description: 'Safe and secure payment processing for your peace of mind'
      },
      landlords: {
        title: 'Verified Landlords',
        description: 'We work only with verified and trustworthy property owners'
      },
      quality: {
        title: 'Quality Assurance',
        description: 'We maintain high standards for all listed properties'
      }
    },
    testimonials: {
      title: 'What Our Users Say',
      subtitle: 'Real experiences from our community',
      viewAll: 'View All Reviews',
      items: {
        default: {
          name: 'Our Community',
          role: 'User',
          comment: 'Join our community and share your experience with GazaRenter.'
        }
      }
    },
    property: {
      details: {
        title: 'Property Details',
        description: 'Description',
        features: 'Features',
        location: 'Location',
        contact: 'Contact Landlord'
      },
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      distance: 'to city center',
      perMonth: 'per month',
      viewDetails: 'View Details',
      available: 'Available Now',
      unavailable: 'Not Available',
      featured: 'Featured Property',
      verified: 'Verified',
      new: 'New',
      amenities: {
        parking: 'Parking',
        security: 'Security',
        pool: 'Swimming Pool',
        gym: 'Gym',
        internet: 'Internet',
        furnished: 'Furnished',
        aircon: 'Air Conditioning',
        garden: 'Garden'
      },
      contact: {
        title: 'Contact Information',
        name: 'Full Name',
        email: 'Email Address',
        phone: 'Phone Number',
        message: 'Your Message',
        send: 'Send Message',
        success: 'Message sent successfully!',
        error: 'Error sending message. Please try again.'
      }
    },
    footer: {
      about: {
        title: 'About GazaRenter',
        description: 'Tanzania\'s premier rental platform connecting quality properties with great tenants.'
      },
      quickLinks: {
        title: 'Quick Links',
        home: 'Home',
        browse: 'Browse Properties',
        mapView: 'Map View',
        landlords: 'For Landlords',
        about: 'About Us',
        contact: 'Contact Us',
        help: 'Help Center'
      },
      cities: {
        title: 'Popular Cities',
        darEsSalaam: 'Dar es Salaam',
        arusha: 'Arusha',
        mwanza: 'Mwanza',
        dodoma: 'Dodoma',
        zanzibar: 'Zanzibar',
        tanga: 'Tanga'
      },
      contact: {
        title: 'Contact Us',
        email: 'info@gazarenter.com',
        phone: '+255 755 123 456',
        address: 'Upanga, Dar es Salaam, Tanzania',
        hours: 'Mon - Sat: 9:00 AM - 6:00 PM'
      },
      social: {
        title: 'Follow Us',
        facebook: 'Facebook',
        twitter: 'Twitter',
        instagram: 'Instagram',
        linkedin: 'LinkedIn'
      },
      legal: {
        title: 'Legal',
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        cookies: 'Cookie Policy'
      },
      copyright: '© 2024 GazaRenter. All rights reserved.'
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'We\'d love to hear from you',
      name: 'Your Name',
      email: 'Email Address',
      phone: 'Phone Number (Optional)',
      message: 'Your Message',
      formTitle: 'Send us a Message',
      send: 'Send Message',
      sending: 'Sending...',
      hours: 'Business Hours',
      success: 'Your message has been sent successfully!',
      error: 'Failed to send message. Please try again.'
    },
    about: {
      hero: {
        title: 'About GazaRenter',
        subtitle: 'A premier platform connecting landlords and tenants in Tanzania through verified listings and secure transactions.'
      },
      mission: {
        title: 'Our Mission',
        description: 'GazaRenter was founded with a simple mission: to make finding and renting homes in Tanzania easier, safer, and more transparent. We believe that everyone deserves a place to call home, and our platform is designed to connect landlords and tenants in the most efficient way possible.',
        description2: 'We verify all listings and landlords to ensure that what you see is what you get. Our secure payment system protects both parties, and our 24/7 support team is ready to help.',
        browseCta: 'Browse Properties',
        contactCta: 'Contact Us'
      },
      stats: {
        title: 'GazaRenter by the Numbers',
        subtitle: 'Our platform has helped thousands of people find their ideal homes in Tanzania.',
        properties: 'Properties Listed',
        customers: 'Satisfied Customers',
        secure: 'Secure Transactions',
        support: 'Customer Support'
      },
      values: {
        title: 'Our Values',
        subtitle: 'The principles that guide everything we do at GazaRenter.',
        integrity: {
          title: 'Integrity',
          description: 'We believe in honesty and transparency in everything we do. Our platform is built on trust and we work hard to maintain that.'
        },
        security: {
          title: 'Security',
          description: 'We prioritize the safety and protection of our users. All transactions are protected and we verify all listings.'
        },
        excellence: {
          title: 'Excellence',
          description: 'We strive for excellence in all aspects of our service. From our platform design to our customer support, we aim to exceed expectations.'
        }
      },
      cta: {
        title: 'Ready to Find Your Ideal Home?',
        subtitle: 'Join thousands of satisfied customers who found their perfect rental property through GazaRenter.',
        browseButton: 'Browse Properties Now'
      },
      privacy: {
        title: 'Privacy Policy',
        subtitle: 'How we protect and manage your data',
        lastUpdated: 'Last updated:',
        sections: {
          information: {
            title: 'Information We Collect',
            content: 'We collect information that you provide directly to us when you register for an account, create or modify your profile, set preferences, sign-up for or make purchases through the Services. This may include your name, email address, phone number, billing information, profile picture, and preferences. We also collect information about your use of our services, such as your search history, properties you view, and interactions with landlords or tenants.'
          },
          usage: {
            title: 'How We Use Your Information',
            content: 'We use the information we collect to provide, maintain, and improve our services, such as to process your requests for information, process your payments, and connect you with landlords or tenants. We also use this information to send you technical notices, updates, security alerts, and support and administrative messages and to respond to your comments, questions, and customer service requests.'
          },
          sharing: {
            title: 'Sharing of Information',
            content: 'We may share information about you with landlords or tenants as necessary to facilitate your use of the Services. We may also share your personal information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf, such as payment processing, data analysis, email delivery, hosting services, customer service, and marketing efforts.'
          },
          cookies: {
            title: 'Cookies and Similar Technologies',
            content: 'We use cookies and similar technologies to collect information about your browsing activities over time and across different websites. Cookies are small data files stored on your hard drive or in device memory that help us improve our Services and your experience, see which areas and features of our Services are popular, and count visits.'
          },
          security: {
            title: 'Security',
            content: 'We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no Internet or email transmission is ever fully secure or error-free.'
          },
          rights: {
            title: 'Your Rights',
            content: 'You can access and update certain information about you from within your account settings. You can also request access to, correction of, or deletion of information we hold about you by contacting us at the email address provided below.'
          },
          contact: {
            title: 'Contact Us',
            content: 'If you have any questions about this Privacy Policy, please contact us at privacy@gazarenter.com.'
          }
        }
      }
    },
    terms: {
      title: 'Terms and Conditions',
      lastUpdated: 'Last Updated',
      contact: {
        title: 'Contact Us',
        content: 'If you have any questions about these Terms, please contact us at'
      },
      sections: {
        acceptance: {
          title: 'Acceptance of Terms',
          content: 'By accessing or using the GazaRenter platform, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.'
        },
        account: {
          title: 'User Accounts',
          content: 'To use certain features of the Site, you must register for an account. You must provide accurate and complete information and keep your account information updated. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.'
        },
        listings: {
          title: 'Property Listings',
          content: 'Property listings on GazaRenter must be accurate and truthful. Landlords are responsible for ensuring that their listings comply with all applicable laws and regulations. GazaRenter reserves the right to remove any listing that violates these terms. Users are encouraged to report any suspicious or inaccurate listings.'
        },
        payments: {
          title: 'Payments and Fees',
          content: 'GazaRenter may charge fees for certain services. All fees are non-refundable unless otherwise stated. By using the platform, you agree to pay all fees and charges associated with your account. Failure to pay fees may result in suspension or termination of your account.'
        },
        communication: {
          title: 'Communication',
          content: 'By creating an account, you agree to receive communications from GazaRenter, including but not limited to emails, text messages, and push notifications. You can opt out of promotional communications, but service-related communications are necessary for the operation of your account.'
        },
        conduct: {
          title: 'User Conduct',
          content: 'You agree not to use the Site for any illegal or unauthorized purpose. You must not, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws). You are responsible for all activity that occurs under your account.'
        },
        intellectual: {
          title: 'Intellectual Property',
          content: 'The Service and its original content, features, and functionality are and will remain the exclusive property of GazaRenter and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of GazaRenter.'
        },
        termination: {
          title: 'Termination',
          content: 'GazaRenter may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.'
        },
        liability: {
          title: 'Limitation of Liability',
          content: 'In no event shall GazaRenter, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.'
        },
        changes: {
          title: 'Changes to Terms',
          content: 'We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.'
        }
      }
    },
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'How we protect and manage your data',
      lastUpdated: 'Last updated:',
      sections: {
        information: {
          title: 'Information We Collect',
          content: 'We collect information that you provide directly to us when you register for an account, create or modify your profile, set preferences, sign-up for or make purchases through the Services. This may include your name, email address, phone number, billing information, profile picture, and preferences. We also collect information about your use of our services, such as your search history, properties you view, and interactions with landlords or tenants.'
        },
        usage: {
          title: 'How We Use Your Information',
          content: 'We use the information we collect to provide, maintain, and improve our services, such as to process your requests for information, process your payments, and connect you with landlords or tenants. We also use this information to send you technical notices, updates, security alerts, and support and administrative messages and to respond to your comments, questions, and customer service requests.'
        },
        sharing: {
          title: 'Sharing of Information',
          content: 'We may share information about you with landlords or tenants as necessary to facilitate your use of the Services. We may also share your personal information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf, such as payment processing, data analysis, email delivery, hosting services, customer service, and marketing efforts.'
        },
        cookies: {
          title: 'Cookies and Similar Technologies',
          content: 'We use cookies and similar technologies to collect information about your browsing activities over time and across different websites. Cookies are small data files stored on your hard drive or in device memory that help us improve our Services and your experience, see which areas and features of our Services are popular, and count visits.'
        },
        security: {
          title: 'Security',
          content: 'We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no Internet or email transmission is ever fully secure or error-free.'
        },
        rights: {
          title: 'Your Rights',
          content: 'You can access and update certain information about you from within your account settings. You can also request access to, correction of, or deletion of information we hold about you by contacting us at the email address provided below.'
        },
        contact: {
          title: 'Contact Us',
          content: 'If you have any questions about this Privacy Policy, please contact us at privacy@gazarenter.com.'
        }
      }
    },
    mapView: {
      title: 'Map View',
      subtitle: 'Find properties by location',
      filters: 'Filters',
      resetFilters: 'Reset all',
      noResults: 'No properties found matching your criteria',
      clearFilters: 'Clear Filters'
    }
  },
  sw: {
    nav: {
      home: 'Nyumbani',
      browse: 'Tafuta',
      mapView: 'Ramani',
      login: 'INGIA',
      register: 'JIANDIKISHE',
      profile: 'Wasifu',
      favorites: 'Vipendwa',
      notifications: 'Taarifa'
    },
    common: {
      backToHome: 'Rudi Nyumbani',
      loading: 'Inapakia...',
      error: 'Hitilafu imetokea',
      success: 'Imefanikiwa',
      submit: 'Wasilisha',
      cancel: 'Ghairi',
      save: 'Hifadhi',
      delete: 'Futa',
      edit: 'Hariri',
      view: 'Angalia',
      search: 'Tafuta',
      filter: 'Chuja',
      sort: 'Panga',
      more: 'Zaidi',
      less: 'Punguza'
    },
    auth: {
      login: {
        title: 'Karibu tena',
        subtitle: 'Tafadhali ingia kwenye akaunti yako',
        email: 'Barua pepe',
        password: 'Nywila',
        rememberMe: 'Nikumbuke',
        forgotPassword: 'Umesahau nywila?',
        signIn: 'Ingia',
        signingIn: 'Inaingia...',
        noAccount: 'Huna akaunti?',
        signUp: 'Jiandikishe',
        orContinueWith: 'Au endelea na',
        register: 'Jiandikishe sasa',
        errorTitle: 'Kuingia kumeshindikana',
        errorMessage: 'Barua pepe au nywila si sahihi'
      },
      register: {
        title: 'Fungua akaunti',
        subtitle: 'Jiandikishe ili kuanza',
        name: 'Jina kamili',
        firstName: 'Jina la Kwanza',
        lastName: 'Jina la Ukoo',
        email: 'Barua pepe',
        phone: 'Namba ya Simu',
        password: 'Nywila',
        confirmPassword: 'Thibitisha nywila',
        userType: 'Mimi ni',
        tenant: 'Mpangaji',
        landlord: 'Mmiliki',
        agreeTerms: 'Nakubali masharti na vigezo',
        terms: 'Masharti na Vigezo',
        orContinueWith: 'Au endelea na',
        signUp: 'Jiandikishe',
        creating: 'Inaunda akaunti...',
        create: 'Unda Akaunti',
        haveAccount: 'Tayari una akaunti?',
        signIn: 'Ingia',
        errorTitle: 'Usajili umeshindikana',
        errorMessage: 'Kulikuwa na tatizo kuunda akaunti yako'
      },
      forgotPassword: {
        title: 'Umesahau nywila',
        subtitle: 'Tutakutumia kiungo cha kuweka upya nywila yako',
        email: 'Barua pepe',
        submit: 'Tuma kiungo cha kuweka upya',
        backToLogin: 'Rudi kwenye kuingia',
        successTitle: 'Angalia barua pepe yako',
        successMessage: 'Ikiwa kuna akaunti iliyopo na barua pepe hiyo, utapokea kiungo cha kuweka upya nywila'
      },
      resetPassword: {
        title: 'Weka upya nywila',
        subtitle: 'Ingiza nywila yako mpya',
        password: 'Nywila mpya',
        confirmPassword: 'Thibitisha nywila mpya',
        submit: 'Weka upya nywila',
        successTitle: 'Kuweka upya nywila kumefanikiwa',
        successMessage: 'Nywila yako imewekwa upya kwa mafanikio'
      }
    },
    hero: {
      title: 'Pata Nyumba Yako Bora Tanzania',
      subtitle: 'Tafuta nyumba elfu zilizothibitishwa',
      location: 'Mahali',
      priceRange: 'Kiwango cha Bei',
      rooms: 'Vyumba',
      search: 'Tafuta Nyumba',
      advanced: 'Utafutaji wa Kina'
    },
    browse: {
      title: 'Tafuta Nyumba',
      subtitle: 'Pata nyumba yako kutoka kwenye orodha yetu bora',
      search: {
        title: 'Tafuta Mali',
        location: 'Mahali, mtaa, au anwani',
        locationPlaceholder: 'Ingiza eneo au mji...',
        propertyType: 'Aina ya Nyumba',
        propertyTypes: {
          all: 'Aina Zote',
          apartment: 'Fleti',
          house: 'Nyumba',
          villa: 'Villa',
          studio: 'Studio',
          penthouse: 'Penthouse',
          duplex: 'Duplex'
        },
        priceRange: 'Kiwango cha Bei',
        priceRanges: {
          all: 'Bei Zote',
          under200k: 'Chini ya TZS 200,000',
          under300k: 'TZS 200,000 - 300,000',
          under500k: 'TZS 300,000 - 500,000',
          above500k: 'Zaidi ya TZS 500,000'
        },
        filters: {
          title: 'Vichujio',
          bedrooms: 'Vyumba vya kulala',
          bathrooms: 'Vyumba vya kuoga',
          amenities: 'Huduma za Ziada',
          priceRange: 'Kiwango cha Bei',
          furnished: 'Ina Samani',
          parking: 'Ina Parking',
          pets: 'Inaruhusu Wanyama',
          security: 'Ulinzi wa Saa 24',
          apply: 'Tumia Vichujio',
          clear: 'Futa Vichujio'
        },
        searchButton: 'Tafuta Sasa',
        moreFilters: 'Vichujio Zaidi',
        hideFilters: 'Ficha Vichujio',
        noResults: 'Hakuna nyumba zinazolingana na vigezo vyako'
      },
      results: {
        showing: 'Inaonyesha',
        properties: 'nyumba',
        sortBy: 'Panga kwa:',
        sortOptions: {
          newest: 'Mpya Zaidi',
          priceAsc: 'Bei (Ndogo hadi Kubwa)',
          priceDesc: 'Bei (Kubwa hadi Ndogo)',
          popular: 'Maarufu Zaidi',
          recommended: 'Pendekezwa'
        }
      }
    },
    features: {
      title: 'Kwa Nini Uchague GazaRenter',
      subtitle: 'Tunafanya utafutaji wa nyumba kuwa rahisi na salama',
      learnMore: 'Jifunze Zaidi',
      exploreMore: 'Chunguza Vipengele Vyote',
      verified: {
        title: 'Nyumba Zilizothibitishwa',
        description: 'Nyumba zote zinathibitishwa kwa ubora na uhalisia'
      },
      secure: {
        title: 'Malipo Salama',
        description: 'Mfumo wa malipo salama na njia nyingi za kulipa'
      },
      support: {
        title: 'Msaada wa Saa 24',
        description: 'Timu yetu ipo tayari kukusaidia wakati wowote'
      }
    },
    featured: {
      title: 'Nyumba Zilizochaguliwa',
      subtitle: 'Pata nyumba zinazofaa maisha yako'
    },
    trust: {
      title: 'Kwa Nini Uamini GazaRenter?',
      subtitle: 'Tunajivunia kudumisha viwango vya juu zaidi katika sekta ya upangishaji',
      verified: {
        title: 'Mali Zilizothibitishwa',
        description: 'Mali zote zimehakikiwa kuhakikisha ubora na uhalali'
      },
      secure: {
        title: 'Malipo Salama',
        description: 'Mfumo wa malipo salama na wa kuaminika kwa amani yako'
      },
      landlords: {
        title: 'Wamiliki Waliothibitishwa',
        description: 'Tunafanya kazi na wamiliki wa mali waliothibitishwa na wa kuaminika'
      },
      quality: {
        title: 'Uhakikisho wa Ubora',
        description: 'Tunadumisha viwango vya juu kwa mali zote zilizoorodheshwa'
      }
    },
    testimonials: {
      title: 'Wateja Wetu Wanasema Nini',
      subtitle: 'Uzoefu halisi kutoka kwa jamii yetu',
      viewAll: 'Angalia Maoni Yote',
      items: {
        default: {
          name: 'Our Community',
          role: 'User',
          comment: 'Join our community and share your experience with GazaRenter.'
        }
      }
    },
    property: {
      details: {
        title: 'Maelezo ya Nyumba',
        description: 'Maelezo',
        features: 'Vipengele',
        location: 'Mahali',
        contact: 'Wasiliana na Mmiliki'
      },
      bedrooms: 'Vyumba vya kulala',
      bathrooms: 'Vyumba vya kuoga',
      distance: 'kutoka mjini',
      perMonth: 'kwa mwezi',
      viewDetails: 'Angalia Maelezo',
      available: 'Inapatikana',
      unavailable: 'Haipatikani',
      featured: 'Nyumba Bora',
      verified: 'Imethibitishwa',
      new: 'Mpya',
      amenities: {
        parking: 'Parking',
        security: 'Ulinzi',
        pool: 'Swimming Pool',
        gym: 'Gym',
        internet: 'Intaneti',
        furnished: 'Ina Samani',
        aircon: 'Air Condition',
        garden: 'Bustani'
      },
      contact: {
        title: 'Taarifa za Mawasiliano',
        name: 'Jina Kamili',
        email: 'Barua Pepe',
        phone: 'Namba ya Simu',
        message: 'Ujumbe Wako',
        send: 'Tuma Ujumbe',
        success: 'Ujumbe umetumwa kikamilifu!',
        error: 'Hitilafu kutuma ujumbe. Tafadhali jaribu tena.'
      }
    },
    footer: {
      about: {
        title: 'Kuhusu GazaRenter',
        description: 'Jukwaa bora la kukodisha nyumba Tanzania linalounganisha nyumba bora na wapangaji wazuri.'
      },
      quickLinks: {
        title: 'Viungo vya Haraka',
        home: 'Nyumbani',
        browse: 'Tafuta Nyumba',
        mapView: 'Ramani',
        landlords: 'Kwa Wamiliki',
        about: 'Kuhusu Sisi',
        contact: 'Wasiliana Nasi',
        help: 'Kituo cha Msaada'
      },
      cities: {
        title: 'Miji Maarufu',
        darEsSalaam: 'Dar es Salaam',
        arusha: 'Arusha',
        mwanza: 'Mwanza',
        dodoma: 'Dodoma',
        zanzibar: 'Zanzibar',
        tanga: 'Tanga'
      },
      contact: {
        title: 'Wasiliana Nasi',
        email: 'info@gazarenter.com',
        phone: '+255 755 123 456',
        address: 'Upanga, Dar es Salaam, Tanzania',
        hours: 'Jumatatu - Jumamosi: 9:00 AM - 6:00 PM'
      },
      social: {
        title: 'Tufuate',
        facebook: 'Facebook',
        twitter: 'Twitter',
        instagram: 'Instagram',
        linkedin: 'LinkedIn'
      },
      legal: {
        title: 'Kisheria',
        terms: 'Masharti ya Huduma',
        privacy: 'Sera ya Faragha',
        cookies: 'Sera ya Vidakuzi'
      },
      copyright: '© 2024 GazaRenter. Haki zote zimehifadhiwa.'
    },
    contact: {
      title: 'Wasiliana Nasi',
      subtitle: 'Tungependa kusikia kutoka kwako',
      name: 'Jina Lako',
      email: 'Barua Pepe',
      phone: 'Namba ya Simu (Hiari)',
      message: 'Ujumbe Wako',
      formTitle: 'Tutumie Ujumbe',
      send: 'Tuma Ujumbe',
      sending: 'Inatuma...',
      hours: 'Saa za Biashara',
      success: 'Ujumbe wako umetumwa kikamilifu!',
      error: 'Imeshindwa kutuma ujumbe. Tafadhali jaribu tena.'
    },
    about: {
      hero: {
        title: 'Kuhusu GazaRenter',
        subtitle: 'Jukwaa bora linalounganisha wamiliki na wapangaji Tanzania kupitia orodha zilizothibitishwa na miamala salama.'
      },
      mission: {
        title: 'Dhamira Yetu',
        description: 'GazaRenter ilianzishwa na dhamira rahisi: kufanya utafutaji na upangaji wa nyumba Tanzania kuwa rahisi, salama, na wazi zaidi. Tunaamini kuwa kila mtu anastahili kuwa na mahali pa kuita nyumbani, na jukwaa letu limebuni kuunganisha wamiliki na wapangaji kwa njia ya ufanisi zaidi.',
        description2: 'Tunathibitisha orodha zote na wamiliki kuhakikisha kuwa unachokiona ndicho unachopata. Mfumo wetu wa malipo salama unalinda pande zote mbili, na timu yetu ya msaada ya saa 24 iko tayari kusaidia.',
        browseCta: 'Tazama Nyumba',
        contactCta: 'Wasiliana Nasi'
      },
      stats: {
        title: 'GazaRenter kwa Takwimu',
        subtitle: 'Jukwaa letu limesaidia maelfu ya watu kupata nyumba zao bora Tanzania.',
        properties: 'Nyumba Zilizoorodheshwa',
        customers: 'Wateja Walioridhika',
        secure: 'Miamala Salama',
        support: 'Msaada kwa Wateja'
      },
      values: {
        title: 'Maadili Yetu',
        subtitle: 'Kanuni zinazoongoza kila tunachofanya katika GazaRenter.',
        integrity: {
          title: 'Uadilifu',
          description: 'Tunaamini katika uaminifu na uwazi katika kila tunachofanya. Jukwaa letu limejengwa juu ya imani na tunafanya kazi kwa bidii kudumisha hilo.'
        },
        security: {
          title: 'Usalama',
          description: 'Tunatanguliza usalama na ulinzi wa watumiaji wetu. Miamala yote inalindwa na tunathibitisha orodha zote.'
        },
        excellence: {
          title: 'Ubora',
          description: 'Tunajitahidi kwa ubora katika nyanja zote za huduma yetu. Kutoka kwa muundo wa jukwaa letu hadi kwa msaada wa mteja, tunalenga kuzidi matarajio.'
        }
      },
      cta: {
        title: 'Uko Tayari Kupata Nyumba Yako Bora?',
        subtitle: 'Jiunge na maelfu ya wateja walioridhika waliopata mali yao bora ya kukodisha kupitia GazaRenter.',
        browseButton: 'Tafuta Nyumba Sasa'
      },
      privacy: {
        title: 'Sera ya Faragha',
        subtitle: 'Jinsi tunavyolinda na kusimamia data yako',
        lastUpdated: 'Imesasishwa mwisho:',
        sections: {
          information: {
            title: 'Taarifa Tunazokusanya',
            content: 'Tunakusanya taarifa ambazo unatupa moja kwa moja unapojiandikisha kwa akaunti, kuunda au kubadilisha wasifu wako, kuweka mapendeleo, kujiandikisha au kufanya ununuzi kupitia Huduma. Hii inaweza kujumuisha jina lako, barua pepe, namba ya simu, taarifa za malipo, picha ya wasifu, na mapendeleo. Pia tunakusanya taarifa kuhusu matumizi yako ya huduma zetu, kama vile historia yako ya utafutaji, mali unazotazama, na mawasiliano na wamiliki au wapangaji.'
          },
          usage: {
            title: 'Jinsi Tunavyotumia Taarifa Zako',
            content: 'Tunatumia taarifa tunazokusanya kutoa, kudumisha, na kuboresha huduma zetu, kama vile kuchakata maombi yako ya taarifa, kuchakata malipo yako, na kukuunganisha na wamiliki au wapangaji. Pia tunatumia taarifa hii kukutumia notisi za kiufundi, masasisho, tahadhari za usalama, na ujumbe wa msaada na utawala na kujibu maoni yako, maswali, na maombi ya huduma za wateja.'
          },
          sharing: {
            title: 'Kushiriki Taarifa',
            content: 'Tunaweza kushiriki taarifa kukuhusu na wamiliki au wapangaji kadri inavyohitajika kuwezesha matumizi yako ya Huduma. Pia tunaweza kushiriki taarifa zako za kibinafsi na wauzaji wengine, washauri, na watoa huduma wengine ambao wanahitaji kufikia taarifa kama hiyo kufanya kazi kwa niaba yetu, kama vile uchakataji wa malipo, uchambuzi wa data, uwasilishaji wa barua pepe, huduma za mwenyeji, huduma kwa wateja, na jitihada za masoko.'
          },
          cookies: {
            title: 'Vidakuzi na Teknolojia Sawa',
            content: 'Tunatumia vidakuzi na teknolojia sawa kukusanya taarifa kuhusu shughuli zako za kuvinjari kwa muda na tovuti tofauti. Vidakuzi ni faili ndogo za data zinazohifadhiwa kwenye diski yako kuu au kwenye kumbukumbu ya kifaa ambazo hutusaidia kuboresha Huduma zetu na uzoefu wako, kuona maeneo na vipengele vipi vya Huduma zetu ni maarufu, na kuhesabu ziara.'
          },
          security: {
            title: 'Usalama',
            content: 'Tunachukua hatua za kutosha kusaidia kulinda taarifa zinazokuhusu dhidi ya upotevu, wizi, matumizi mabaya, ufikiaji usioruhusiwa, ufichuzi, mabadiliko, na uharibifu. Hata hivyo, hakuna Intaneti au uwasilishaji wa barua pepe ambao ni salama kabisa au haukosi.'
          },
          rights: {
            title: 'Haki Zako',
            content: 'Unaweza kufikia na kusasisha taarifa fulani kukuhusu kutoka ndani ya mipangilio ya akaunti yako. Unaweza pia kuomba ufikiaji, marekebisho, au ufutaji wa taarifa tunazoshikilia kukuhusu kwa kuwasiliana nasi kwa anwani ya barua pepe iliyotolewa hapa chini.'
          },
          contact: {
            title: 'Wasiliana Nasi',
            content: 'Ikiwa una maswali yoyote kuhusu Sera hii ya Faragha, tafadhali wasiliana nasi kwa privacy@gazarenter.com.'
          }
        }
      },
      terms: {
        title: 'Masharti na Vigezo',
        lastUpdated: 'Imesasishwa Mwisho',
        contact: {
          title: 'Wasiliana Nasi',
          content: 'Ikiwa una maswali yoyote kuhusu Masharti haya, tafadhali wasiliana nasi kupitia'
        },
        sections: {
          acceptance: {
            title: 'Kukubali Masharti',
            content: 'Kwa kufikia au kutumia jukwaa la GazaRenter, unakubali kufungwa na Masharti na Vigezo haya na sheria na kanuni zote zinazotumika. Ikiwa hukubaliani na masharti yoyote haya, unapigwa marufuku kutumia au kufikia tovuti hii.'
          },
          account: {
            title: 'Akaunti za Watumiaji',
            content: 'Ili kutumia vipengele fulani vya Tovuti, lazima ujisajili kwa akaunti. Lazima utoe taarifa sahihi na kamili na kuweka taarifa za akaunti yako zimesasishwa. Unawajibika kudumisha usiri wa akaunti yako na nenosiri na kuzuia ufikiaji wa kompyuta yako. Unakubali kukubali wajibu wa shughuli zote zinazotokea chini ya akaunti yako au nenosiri.'
          },
          listings: {
            title: 'Orodha za Mali',
            content: 'Orodha za mali kwenye GazaRenter lazima ziwe sahihi na za kweli. Wamiliki wanawajibika kuhakikisha kwamba orodha zao zinazingatia sheria na kanuni zote zinazotumika. GazaRenter inahifadhi haki ya kuondoa orodha yoyote inayokiuka masharti haya. Watumiaji wanahimizwa kuripoti orodha zozote za mashaka au zisizo sahihi.'
          },
          payments: {
            title: 'Malipo na Ada',
            content: 'GazaRenter inaweza kutoza ada kwa huduma fulani. Ada zote hazirejeshwi isipokuwa imedokezwa vinginevyo. Kwa kutumia jukwaa hili, unakubali kulipa ada zote na gharama zinazohusiana na akaunti yako. Kushindwa kulipa ada kunaweza kusababisha kusimamishwa au kufutwa kwa akaunti yako.'
          },
          communication: {
            title: 'Mawasiliano',
            content: 'Kwa kuunda akaunti, unakubali kupokea mawasiliano kutoka GazaRenter, ikiwa ni pamoja na lakini sio tu barua pepe, ujumbe wa maandishi, na arifa za kusukuma. Unaweza kujiondoa kwenye mawasiliano ya kukuza, lakini mawasiliano yanayohusiana na huduma ni muhimu kwa uendeshaji wa akaunti yako.'
          },
          conduct: {
            title: 'Mwenendo wa Mtumiaji',
            content: 'Unakubali kutotumia Tovuti kwa makusudi yoyote haramu au yasiyoidhinishwa. Lazima usivunje sheria zozote katika mamlaka yako (ikiwa ni pamoja na lakini sio tu sheria za hakimiliki) katika matumizi ya Huduma. Unawajibika kwa shughuli zote zinazotokea chini ya akaunti yako.'
          },
          intellectual: {
            title: 'Mali ya Kiakili',
            content: 'Huduma na maudhui yake ya asili, vipengele, na utendaji ni na yatabaki kuwa mali ya kipekee ya GazaRenter na wenye leseni wake. Huduma inalindwa na hakimiliki, alama ya biashara, na sheria nyingine. Alama zetu za biashara na mavazi ya biashara hayawezi kutumika kuhusiana na bidhaa au huduma yoyote bila idhini ya maandishi ya awali ya GazaRenter.'
          },
          termination: {
            title: 'Kumaliza',
            content: 'GazaRenter inaweza kufuta au kusimamisha akaunti yako mara moja, bila taarifa ya awali au dhima, kwa sababu yoyote, ikiwa ni pamoja na bila kikomo ikiwa unakiuka Masharti. Baada ya kumaliza, haki yako ya kutumia Huduma itakoma mara moja.'
          },
          liability: {
            title: 'Kikomo cha Dhima',
            content: 'Kwa hali yoyote GazaRenter, wala wakurugenzi wake, wafanyakazi, washirika, mawakala, wazabuni, au washirika, watawajibika kwa uharibifu wowote usio wa moja kwa moja, wa bahati mbaya, maalum, wa matokeo au adhabu, ikiwa ni pamoja na bila kikomo, kupoteza faida, data, matumizi, nia njema, au hasara zingine zisizoonekana, zinazotokana na ufikiaji wako au matumizi ya au kushindwa kufikiaji au kutumia Huduma.'
          },
          changes: {
            title: 'Mabadiliko ya Masharti',
            content: 'Tunahifadhi haki, kwa uamuzi wetu wa pekee, kubadilisha au kubadilisha Masharti haya wakati wowote. Kwa kuendelea kufikiaji au kutumia Huduma yetu baada ya marekebisho hayo kuanza kutumika, unakubali kufungwa na masharti yaliyorekebishwa.'
          }
        }
      }
    },
    terms: {
      title: 'Masharti na Vigezo',
      lastUpdated: 'Imesasishwa Mwisho',
      contact: {
        title: 'Wasiliana Nasi',
        content: 'Ikiwa una maswali yoyote kuhusu Masharti haya, tafadhali wasiliana nasi kupitia'
      },
      sections: {
        acceptance: {
          title: 'Kukubali Masharti',
          content: 'Kwa kufikia au kutumia jukwaa la GazaRenter, unakubali kufungwa na Masharti na Vigezo haya na sheria na kanuni zote zinazotumika. Ikiwa hukubaliani na masharti yoyote haya, unapigwa marufuku kutumia au kufikia tovuti hii.'
        },
        account: {
          title: 'Akaunti za Watumiaji',
          content: 'Ili kutumia vipengele fulani vya Tovuti, lazima ujisajili kwa akaunti. Lazima utoe taarifa sahihi na kamili na kuweka taarifa za akaunti yako zimesasishwa. Unawajibika kudumisha usiri wa akaunti yako na nenosiri na kuzuia ufikiaji wa kompyuta yako. Unakubali kukubali wajibu wa shughuli zote zinazotokea chini ya akaunti yako au nenosiri.'
        },
        listings: {
          title: 'Orodha za Mali',
          content: 'Orodha za mali kwenye GazaRenter lazima ziwe sahihi na za kweli. Wamiliki wanawajibika kuhakikisha kwamba orodha zao zinazingatia sheria na kanuni zote zinazotumika. GazaRenter inahifadhi haki ya kuondoa orodha yoyote inayokiuka masharti haya. Watumiaji wanahimizwa kuripoti orodha zozote za mashaka au zisizo sahihi.'
        },
        payments: {
          title: 'Malipo na Ada',
          content: 'GazaRenter inaweza kutoza ada kwa huduma fulani. Ada zote hazirejeshwi isipokuwa imedokezwa vinginevyo. Kwa kutumia jukwaa hili, unakubali kulipa ada zote na gharama zinazohusiana na akaunti yako. Kushindwa kulipa ada kunaweza kusababisha kusimamishwa au kufutwa kwa akaunti yako.'
        },
        communication: {
          title: 'Mawasiliano',
          content: 'Kwa kuunda akaunti, unakubali kupokea mawasiliano kutoka GazaRenter, ikiwa ni pamoja na lakini sio tu barua pepe, ujumbe wa maandishi, na arifa za kusukuma. Unaweza kujiondoa kwenye mawasiliano ya kukuza, lakini mawasiliano yanayohusiana na huduma ni muhimu kwa uendeshaji wa akaunti yako.'
        },
        conduct: {
          title: 'Mwenendo wa Mtumiaji',
          content: 'Unakubali kutotumia Tovuti kwa makusudi yoyote haramu au yasiyoidhinishwa. Lazima usivunje sheria zozote katika mamlaka yako (ikiwa ni pamoja na lakini sio tu sheria za hakimiliki) katika matumizi ya Huduma. Unawajibika kwa shughuli zote zinazotokea chini ya akaunti yako.'
        },
        intellectual: {
          title: 'Mali ya Kiakili',
          content: 'Huduma na maudhui yake ya asili, vipengele, na utendaji ni na yatabaki kuwa mali ya kipekee ya GazaRenter na wenye leseni wake. Huduma inalindwa na hakimiliki, alama ya biashara, na sheria nyingine. Alama zetu za biashara na mavazi ya biashara hayawezi kutumika kuhusiana na bidhaa au huduma yoyote bila idhini ya maandishi ya awali ya GazaRenter.'
        },
        termination: {
          title: 'Kumaliza',
          content: 'GazaRenter inaweza kufuta au kusimamisha akaunti yako mara moja, bila taarifa ya awali au dhima, kwa sababu yoyote, ikiwa ni pamoja na bila kikomo ikiwa unakiuka Masharti. Baada ya kumaliza, haki yako ya kutumia Huduma itakoma mara moja.'
        },
        liability: {
          title: 'Kikomo cha Dhima',
          content: 'Kwa hali yoyote GazaRenter, wala wakurugenzi wake, wafanyakazi, washirika, mawakala, wazabuni, au washirika, watawajibika kwa uharibifu wowote usio wa moja kwa moja, wa bahati mbaya, maalum, wa matokeo au adhabu, ikiwa ni pamoja na bila kikomo, kupoteza faida, data, matumizi, nia njema, au hasara zingine zisizoonekana, zinazotokana na ufikiaji wako au matumizi ya au kushindwa kufikiaji au kutumia Huduma.'
        },
        changes: {
          title: 'Mabadiliko ya Masharti',
          content: 'Tunahifadhi haki, kwa uamuzi wetu wa pekee, kubadilisha au kubadilisha Masharti haya wakati wowote. Kwa kuendelea kufikiaji au kutumia Huduma yetu baada ya marekebisho hayo kuanza kutumika, unakubali kufungwa na masharti yaliyorekebishwa.'
        }
      }
    },
    privacy: {
      title: 'Sera ya Faragha',
      subtitle: 'Jinsi tunavyolinda na kusimamia data yako',
      lastUpdated: 'Imesasishwa mwisho:',
      sections: {
        information: {
          title: 'Taarifa Tunazokusanya',
          content: 'Tunakusanya taarifa ambazo unatupa moja kwa moja unapojiandikisha kwa akaunti, kuunda au kubadilisha wasifu wako, kuweka mapendeleo, kujiandikisha au kufanya ununuzi kupitia Huduma. Hii inaweza kujumuisha jina lako, barua pepe, namba ya simu, taarifa za malipo, picha ya wasifu, na mapendeleo. Pia tunakusanya taarifa kuhusu matumizi yako ya huduma zetu, kama vile historia yako ya utafutaji, mali unazotazama, na mawasiliano na wamiliki au wapangaji.'
        },
        usage: {
          title: 'Jinsi Tunavyotumia Taarifa Zako',
          content: 'Tunatumia taarifa tunazokusanya kutoa, kudumisha, na kuboresha huduma zetu, kama vile kuchakata maombi yako ya taarifa, kuchakata malipo yako, na kukuunganisha na wamiliki au wapangaji. Pia tunatumia taarifa hii kukutumia notisi za kiufundi, masasisho, tahadhari za usalama, na ujumbe wa msaada na utawala na kujibu maoni yako, maswali, na maombi ya huduma za wateja.'
        },
        sharing: {
          title: 'Kushiriki Taarifa',
          content: 'Tunaweza kushiriki taarifa kukuhusu na wamiliki au wapangaji kadri inavyohitajika kuwezesha matumizi yako ya Huduma. Pia tunaweza kushiriki taarifa zako za kibinafsi na wauzaji wengine, washauri, na watoa huduma wengine ambao wanahitaji kufikia taarifa kama hiyo kufanya kazi kwa niaba yetu, kama vile uchakataji wa malipo, uchambuzi wa data, uwasilishaji wa barua pepe, huduma za mwenyeji, huduma kwa wateja, na jitihada za masoko.'
        },
        cookies: {
          title: 'Vidakuzi na Teknolojia Sawa',
          content: 'Tunatumia vidakuzi na teknolojia sawa kukusanya taarifa kuhusu shughuli zako za kuvinjari kwa muda na tovuti tofauti. Vidakuzi ni faili ndogo za data zinazohifadhiwa kwenye diski yako kuu au kwenye kumbukumbu ya kifaa ambazo hutusaidia kuboresha Huduma zetu na uzoefu wako, kuona maeneo na vipengele vipi vya Huduma zetu ni maarufu, na kuhesabu ziara.'
        },
        security: {
          title: 'Usalama',
          content: 'Tunachukua hatua za kutosha kusaidia kulinda taarifa zinazokuhusu dhidi ya upotevu, wizi, matumizi mabaya, ufikiaji usioruhusiwa, ufichuzi, mabadiliko, na uharibifu. Hata hivyo, hakuna Intaneti au uwasilishaji wa barua pepe ambao ni salama kabisa au haukosi.'
        },
        rights: {
          title: 'Haki Zako',
          content: 'Unaweza kufikia na kusasisha taarifa fulani kukuhusu kutoka ndani ya mipangilio ya akaunti yako. Unaweza pia kuomba ufikiaji, marekebisho, au ufutaji wa taarifa tunazoshikilia kukuhusu kwa kuwasiliana nasi kwa anwani ya barua pepe iliyotolewa hapa chini.'
        },
        contact: {
          title: 'Wasiliana Nasi',
          content: 'Ikiwa una maswali yoyote kuhusu Sera hii ya Faragha, tafadhali wasiliana nasi kwa privacy@gazarenter.com.'
        }
      }
    },
    mapView: {
      title: 'Ramani',
      subtitle: 'Tafuta nyumba kwa eneo',
      filters: 'Chuja',
      resetFilters: 'Ondoa chuja zote',
      noResults: 'Hakuna nyumba zinazolingana na vigezo vyako',
      clearFilters: 'Ondoa Chuja'
    }
  }
}; 