// Edit your personal details here. These are the defaults; the admin page can
// override any of them at runtime (saved to localStorage under the key below).
export const PROFILE_OVERRIDE_KEY = 'qa_profile_overrides'

const defaultProfile = {
  name: 'I Ketut Dala Cahyoga',
  firstName: 'Dala',
  role: 'QA Engineer',
  tagline: 'Manual & Automation Testing · Web · Mobile · API',
  location: 'Jakarta & Bali, Indonesia',
  // Local asset (bundled) so it always loads even without external network access.
  photo: '/dala-profile-new.PNG',
  email: 'dalacahyoga99@gmail.com',
  phone: '+62 878 6013 6274',
  about:
    'Detail-oriented Software Quality Assurance Engineer with 4+ years of experience in manual and automated testing across web, mobile (Android & iOS), and client-server applications. Certified in Agile with hands-on Scrum, and experienced in SDLC/STLC and validation testing. A clear communicator who works well in a team.',
  links: {
    linkedin: 'https://www.linkedin.com/in/dalacahyoga',
    github: 'https://github.com/dalacahyoga',
  },
}

// The list of fields the admin "Edit konten" form exposes.
export const EDITABLE_FIELDS = [
  { key: 'name', label: 'Full name' },
  { key: 'firstName', label: 'First name' },
  { key: 'role', label: 'Role / title' },
  { key: 'tagline', label: 'Tagline' },
  { key: 'location', label: 'Location' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'photo', label: 'Photo URL / path' },
  { key: 'about', label: 'About', multiline: true },
  { key: 'linkedin', label: 'LinkedIn URL', link: true },
  { key: 'github', label: 'GitHub URL', link: true },
]

function loadOverrides() {
  try { return JSON.parse(localStorage.getItem(PROFILE_OVERRIDE_KEY)) || {} } catch { return {} }
}

const ov = loadOverrides()
export const profileDefaults = defaultProfile
export const profile = {
  ...defaultProfile,
  ...ov,
  links: { ...defaultProfile.links, ...(ov.links || {}) },
}

export const experience = [
  {
    role: 'Software Quality Assurance Engineer',
    company: 'PT Avows Technologies Indonesia',
    client: 'Assigned to Amar Bank',
    period: 'Aug 2024 — Present',
    points: [
      'Work in a Kanban team with business analysts and developers under Agile methodology.',
      'Create and execute test cases for System Integration Testing (SIT) and User Acceptance Testing (UAT), reporting results to users.',
      'Build E2E regression automation with CodeceptJS on a BDD/Cucumber framework and generate Cucumber HTML reports.',
      'Use Jira for bug tracking, task management & version control, and Confluence for ISO QA documentation.',
      'Handling Corebank System Service.',
      'Handling Middleware External Service (Rintis, Travest & WBK Platform).',
    ],
  },
  {
    role: 'Software Quality Assurance Engineer',
    company: 'PT Sharing Vision Indonesia',
    client: 'Assigned to Bank Rakyat Indonesia (BRI)',
    period: 'Sep 2023 — Jul 2024',
    points: [
      'Work in a Kanban team with business analysts and developers under Agile methodology.',
      'Create and execute test cases for System Integration Testing (SIT) and User Acceptance Testing (UAT), reporting results to users.',
      'Build E2E regression automation with Katalon Studio on a BDD/Cucumber framework and generate Cucumber HTML reports.',
      'Use Jira for bug tracking, task management & version control, and Confluence for ISO QA documentation.',
    ],
  },
  {
    role: 'Software Quality Assurance',
    company: 'PT Sharing Vision Indonesia',
    client: 'Assigned to Bank Indonesia (Central Bank)',
    period: 'Jul 2022 — Sep 2023',
    points: [
      'Worked in a Waterfall methodology with business analysts and the developer team on the BI-FAST program.',
      'Authored test cases for SIT & UAT (BI-FAST functional-based and API-based) and for the Industrial Wide Test.',
      'Executed SIT and assisted users and participant banks during UAT and Industrial Wide Test.',
      'Used Jira for bug tracking, task management and version control.',
    ],
  },
  {
    role: 'Intern Cyber Security Trainee',
    company: 'Telkom University',
    client: 'Informatics Department',
    period: 'Jun 2020 — Aug 2020',
    points: [
      'Introduction to penetration testing and setting up a pentest lab.',
      'Practiced network & vulnerability scanning, exploitation & post-exploitation.',
      'Practiced information gathering and brute-force attack techniques.',
    ],
  },
]

export const education = [
  {
    degree: 'Bachelor Degree in Informatics',
    school: 'Telkom University',
    location: 'Bandung, Indonesia',
    period: 'Aug 2017 — Sep 2021',
    points: [
      'Final Project: Semantic code clone detection using the IOE-BEHAVIOR method in Java source code.',
      'Active on Organization Interfest 2018 as Staff.',
    ],
  },
  {
    degree: 'Science Major',
    school: 'SMA N 1 Ubud',
    location: 'Bali, Indonesia',
    period: 'Jul 2014 — Jun 2017',
    points: [
      'Natural Sciences stream — focused on mathematics and science subjects.',
      'Active in the Computer extracurricular.',
    ],
  },
]

export const skills = [
  'Manual Testing', 'Automation Testing', 'AS400', 'Katalon Studio', 'CodeceptJS', 'Selenium', 'BDD / Cucumber',
  'Java', 'Groovy', 'Python', 'Postman (API Testing)', 'MySQL', 'Git',
  'SIT', 'UAT', 'Bitbucket', 'Jira', 'TestRail', 'Confluence', 'Agile / Scrum', 'Waterfall', 'SDLC / STLC',
  'Requirement Understanding',
]

export const projects = [
  {
    name: 'BI-FAST',
    role: 'Software Quality Assurance',
    org: 'Bank Indonesia (Central Bank of Indonesia)',
    link: 'https://www.bi.go.id/id/fungsi-utama/sistem-pembayaran/ritel/infrastruktur/default.aspx',
    desc: "BI-FAST is Indonesia's national real-time retail payment infrastructure, enabling instant 24/7 interbank fund transfers.",
  },
  {
    name: 'BRI Merchant',
    role: 'Software Quality Assurance Engineer',
    org: 'PT Bank Rakyat Indonesia (Persero) Tbk',
    link: 'https://jadimerchant.bri.co.id/brimerchant',
    desc: 'BRI Merchant is a one-stop app solution that answers all BRI merchant needs.',
  },
  {
    name: 'Amar Bank Bisnis (Ambis)',
    role: 'Software Quality Assurance Engineer',
    org: 'PT Bank Amar Indonesia Tbk',
    link: 'https://amarbank.co.id/bisnis',
    desc: 'Ambis (Amar Bank Bisnis) is a digital business banking app for SMEs — managing accounts, transfers and cash management in one place.',
  },
]

export const certificates = [
  {
    title: 'DevSecOps Technical Excellence',
    issuer: 'Narada Code × Bank Rakyat Indonesia (ISG)',
    year: '2024',
    image: '/certificates/bsdp-bri.png',
    link: 'https://drive.google.com/file/d/1-K0dyxPBljn_mAk8irsNe3id08CTWt5P/view?usp=sharing',
    desc: 'Recognition for technical excellence in DevSecOps — integrating security throughout the software delivery pipeline.',
  },
  {
    title: 'Bootcamp Programming',
    issuer: 'SDD IT Hub',
    year: '2022',
    image: '/certificates/bootcamp-programming.png',
    link: 'https://drive.google.com/file/d/1ZOXtS98k29QXoCGK0ANeuuaa42YJBUqN/view?usp=sharing',
    desc: 'Intensive programming bootcamp covering software development fundamentals and hands-on coding practice.',
  },
  {
    title: 'Java Programming: Solving Problems with Software',
    issuer: 'Duke University (Coursera)',
    year: '2021',
    image: '/certificates/duke-java-programming.png',
    link: 'https://coursera.org/verify/QDH4J7CFJN8W',
    desc: 'Designing and writing Java programs to read, transform and analyze data while solving real problems.',
  },
  {
    title: 'Crash Course on Python',
    issuer: 'Google (Coursera)',
    year: '2020',
    image: '/certificates/google-crash-course-python.png',
    link: 'https://coursera.org/verify/XJJBJVZ4CSLG',
    desc: 'Practical introduction to Python programming and automation for real-world IT and testing tasks.',
  },
  {
    title: 'Introduction to Git and GitHub',
    issuer: 'Google (Coursera)',
    year: '2020',
    image: '/certificates/google-git-github.png',
    link: 'https://coursera.org/verify/ECBMXCDR63ED',
    desc: 'Version control fundamentals with Git and collaboration workflows on GitHub.',
  },
  {
    title: 'Programming for Everybody (Getting Started with Python)',
    issuer: 'University of Michigan (Coursera)',
    year: '2020',
    image: '/certificates/michigan-programming-everybody.png',
    link: 'https://coursera.org/verify/D87SRJM9MN98',
    desc: 'Foundations of programming with Python — variables, control flow, functions and core data structures.',
  },
  {
    title: 'Neural Networks and Deep Learning',
    issuer: 'DeepLearning.AI (Coursera)',
    year: '2020',
    image: '/certificates/dl-neural-networks.png',
    link: 'https://coursera.org/verify/HTKN8FZGMMGA',
    desc: 'Building and training deep neural networks — the foundation of modern deep learning.',
  },
  {
    title: 'Improving Deep Neural Networks',
    issuer: 'DeepLearning.AI (Coursera)',
    year: '2020',
    image: '/certificates/dl-improving-dnn.png',
    link: 'https://coursera.org/verify/AGRPXQP3P3AF',
    desc: 'Hyperparameter tuning, regularization and optimization techniques to improve deep neural networks.',
  },
  {
    title: 'Data Science Math Skills',
    issuer: 'Duke University (Coursera)',
    year: '2020',
    image: '/certificates/duke-data-science-math.png',
    link: 'https://coursera.org/verify/DULVEZL236FE',
    desc: 'Core mathematics for data science — sets, functions, probability and the foundations of statistics.',
  },
  {
    title: 'Cybersecurity and the Internet of Things',
    issuer: 'University System of Georgia (Coursera)',
    year: '2020',
    image: '/certificates/georgia-cybersecurity-iot.png',
    link: 'https://coursera.org/verify/4GW9G4EHTQQX',
    desc: 'Security considerations and threat models for connected IoT devices and systems.',
  },
  {
    title: 'Information & Digital Literacy for University Success',
    issuer: 'The University of Sydney (Coursera)',
    year: '2020',
    image: '/certificates/sydney-digital-literacy.png',
    link: 'https://coursera.org/verify/DGZ64LZN53JD',
    desc: 'Research, evaluation and responsible use of digital information for academic success.',
  },
]
