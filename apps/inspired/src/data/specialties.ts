export interface Specialty {
	slug: string;
	name: string;
	heroTitle: string;
	heroDescription: string;
	understanding: {
		title: string;
		description: string;
	};
	services: {
		title: string;
		description: string;
	}[];
	conditions: {
		title: string;
		description: string;
	}[];
	importance?: {
		title: string;
		content: string;
		riskFactors?: {
			title: string;
			content: string;
		}[];
	};
	diagnosticTools: {
		title: string;
		description: string;
	}[];
	whyChooseUs: string[];
}

export const specialtiesData: Record<string, Specialty> = {
	"cardiac-sciences": {
		slug: "cardiac-sciences",
		name: "Cardiac Sciences",
		heroTitle: "Exceptional Cardiac Care",
		heroDescription: "Our Cardiology Department is committed to delivering world-class heart care through cutting-edge technology, experienced specialists, and patient-centered treatment protocols. We specialize in the prevention, diagnosis, and treatment of a wide range of cardiovascular conditions, including coronary artery disease, heart failure, arrhythmias, and congenital heart disorders.",
		understanding: {
			title: "Understanding Cardiology",
			description: "Cardiology focuses on the diagnosis and treatment of diseases affecting the heart and blood vessels, known as the cardiovascular system."
		},
		services: [
			{
				title: "Diagnostic Testing",
				description: "Advanced imaging and testing, including ECG, echocardiograms, stress tests, and cardiac CT/MRI, for accurate diagnosis."
			},
			{
				title: "Interventional Cardiology",
				description: "Minimally invasive procedures like angioplasty and stent placement to treat blocked arteries."
			},
			{
				title: "Electrophysiology",
				description: "Diagnosis and treatment of heart rhythm disorders, including pacemaker and defibrillator implantation."
			},
			{
				title: "Cardiac Surgery",
				description: "Expert surgical interventions, such as coronary artery bypass grafting (CABG) and valve repair/replacement."
			},
			{
				title: "Preventive Cardiology",
				description: "Risk assessments and lifestyle counseling to manage cholesterol, blood pressure, and prevent heart disease."
			},
			{
				title: "Cardiac Rehabilitation",
				description: "Personalized exercise and education programs to support recovery and long-term heart health."
			}
		],
		conditions: [
			{
				title: "Coronary Artery Disease (CAD)",
				description: "Narrowing of arteries causing chest pain or heart attacks."
			},
			{
				title: "Heart Failure",
				description: "Inability of the heart to pump blood effectively, leading to fatigue and fluid retention."
			},
			{
				title: "Arrhythmias",
				description: "Irregular heart rhythms, such as atrial fibrillation, managed with medication or devices."
			},
			{
				title: "Valvular Heart Disease",
				description: "Issues with heart valves causing leakage or obstruction of blood flow."
			},
			{
				title: "Hypertension",
				description: "High blood pressure, a key risk factor for heart disease."
			},
			{
				title: "Congenital Heart Defects",
				description: "Structural heart issues present at birth, treated surgically or with catheters."
			}
		],
		importance: {
			title: "The Importance of Heart Health",
			content: "The heart, a vital organ that beats approximately 100,000 times daily, pumps about 2,000 gallons of blood to deliver oxygen and nutrients throughout the body. Maintaining heart health is crucial, as cardiovascular disease is the leading cause of death globally.",
			riskFactors: [
				{
					title: "Risk Factors for Heart Disease",
					content: "Key risk factors include modifiable factors like smoking, poor diet, physical inactivity, and obesity, as well as non-modifiable factors like age and family history. Our preventive cardiology programs help patients reduce these risks through lifestyle changes and medical management."
				}
			]
		},
		diagnosticTools: [
			{
				title: "Advanced Diagnostic Tools",
				description: "We utilize state-of-the-art tools, including ECG, echocardiography, cardiac CT/MRI, stress testing, and coronary angiography, to diagnose heart conditions with precision."
			}
		],
		whyChooseUs: [
			"Expert Team: A dedicated team of highly skilled cardiologists with advanced training.",
			"Cutting-Edge Technology: Access to the latest diagnostic and treatment technologies.",
			"Patient-Centered Care: Individualized treatment plans tailored to each patient's unique needs.",
			"Comprehensive Services: From preventive care and early diagnosis to advanced interventions and rehabilitation."
		]
	},
	neurosciences: {
		slug: "neurosciences",
		name: "Neurosciences",
		heroTitle: "Expert Neurology Care",
		heroDescription: "Our Neurology Department is dedicated to providing comprehensive and advanced care for disorders of the brain, spine, and nervous system, utilizing cutting-edge diagnostics and treatments.",
		understanding: {
			title: "Understanding Neurology",
			description: "Neurology is the medical specialty focused on diagnosing and treating disorders of the nervous system, including the brain, spinal cord, nerves, and muscles. Our neurologists address conditions such as epilepsy, stroke, Parkinson’s disease, and multiple sclerosis, emphasizing early diagnosis and innovative therapies."
		},
		services: [
			{ title: "Diagnostic Testing", description: "Advanced imaging like MRI, CT, EEG, and EMG to diagnose neurological conditions accurately." },
			{ title: "Stroke Care", description: "Rapid intervention, thrombolytic therapy, and rehabilitation for stroke patients." },
			{ title: "Epilepsy Management", description: "Medication, ketogenic diet, and surgical options for seizure control." },
			{ title: "Neurosurgery", description: "Minimally invasive and complex surgeries for brain and spine disorders." },
			{ title: "Neurorehabilitation", description: "Physical, occupational, and speech therapy to support recovery." },
			{ title: "Movement Disorders Clinic", description: "Specialized care for Parkinson’s disease, tremors, and dystonia." }
		],
		conditions: [
			{ title: "Stroke", description: "Sudden loss of brain function due to interrupted blood flow." },
			{ title: "Epilepsy", description: "Recurrent seizures caused by abnormal brain activity." },
			{ title: "Parkinson’s Disease", description: "A progressive disorder affecting movement and coordination." },
			{ title: "Multiple Sclerosis", description: "An autoimmune condition damaging nerve fibers." },
			{ title: "Migraines", description: "Severe headaches often accompanied by nausea and sensitivity to light." },
			{ title: "Neuropathy", description: "Nerve damage causing numbness, tingling, or weakness." }
		],
		diagnosticTools: [
			{ title: "Advanced Diagnostics", description: "We utilize state-of-the-art tools, including MRI, CT, EEG, and EMG, to diagnose neurological conditions with precision." }
		],
		whyChooseUs: [
			"Expert Team: Highly skilled neurologists and neurosurgeons.",
			"Advanced Technology: Access to the latest diagnostic and surgical tools.",
			"Comprehensive Care: Integrated approach from diagnosis to rehabilitation."
		]
	},
	orthopaedics: {
		slug: "orthopaedics",
		name: "Orthopaedics",
		heroTitle: "Expert Orthopaedic Care",
		heroDescription: "Our Orthopedics Department specializes in the diagnosis, treatment, and rehabilitation of musculoskeletal conditions, using advanced surgical and non-surgical techniques to restore function and enhance quality of life.",
		understanding: {
			title: "Understanding Orthopedics",
			description: "Orthopedics focuses on conditions affecting the musculoskeletal system, including fractures, arthritis, and sports injuries. Our orthopedic specialists use advanced surgical and non-surgical techniques to treat conditions, restore function, and enhance quality of life."
		},
		services: [
			{ title: "Joint Replacement", description: "Hip, knee, and shoulder replacements using minimally invasive techniques." },
			{ title: "Sports Medicine", description: "Treatment of sports-related injuries, including ACL tears and rotator cuff injuries." },
			{ title: "Spine Surgery", description: "Surgical and non-surgical treatments for herniated discs and spinal deformities." },
			{ title: "Fracture Care", description: "Management of fractures with casting, surgery, or internal fixation." },
			{ title: "Physical Therapy", description: "Customized rehabilitation programs to restore strength and mobility." },
			{ title: "Pediatric Orthopedics", description: "Care for congenital and developmental musculoskeletal conditions in children." }
		],
		conditions: [
			{ title: "Osteoarthritis", description: "Degenerative joint disease causing pain and stiffness." },
			{ title: "Fractures", description: "Broken bones requiring immobilization or surgery." },
			{ title: "Rotator Cuff Injuries", description: "Tears or inflammation in shoulder muscles." },
			{ title: "Herniated Disc", description: "Spinal disc rupture causing back or leg pain." },
			{ title: "ACL Tears", description: "Ligament injuries in the knee, common in athletes." },
			{ title: "Carpal Tunnel Syndrome", description: "Nerve compression causing hand pain and numbness." }
		],
		diagnosticTools: [
			{ title: "Orthopedic Diagnostics", description: "Advanced imaging and diagnostic tools to identify musculoskeletal issues precisely." }
		],
		whyChooseUs: [
			"Expert Surgeons: Specialized in complex orthopedic procedures.",
			"Modern Facilities: Equipped with advanced surgical suites.",
			"Personalized Rehab: Tailored physical therapy for faster recovery."
		]
	},
	"cancer-care": {
		slug: "cancer-care",
		name: "Cancer Care",
		heroTitle: "Expert Oncology Care",
		heroDescription: "Our Oncology Department provides compassionate, cutting-edge cancer care, utilizing advanced diagnostics and personalized treatment plans to achieve the best outcomes.",
		understanding: {
			title: "Understanding Oncology",
			description: "Oncology is the medical specialty dedicated to the diagnosis, treatment, and prevention of cancer. Our oncologists treat all types of cancer, using a combination of surgery, chemotherapy, radiation, immunotherapy, and targeted therapies to achieve the best outcomes."
		},
		services: [
			{ title: "Cancer Screening", description: "Early detection through mammograms, colonoscopies, and other screenings." },
			{ title: "Chemotherapy", description: "Advanced chemotherapy regimens tailored to each patient’s needs." },
			{ title: "Radiation Therapy", description: "Precise radiation treatments using state-of-the-art technology." },
			{ title: "Surgical Oncology", description: "Minimally invasive and complex surgeries to remove tumors." },
			{ title: "Immunotherapy", description: "Harnessing the immune system to fight cancer cells." },
			{ title: "Palliative Care", description: "Supportive care to improve quality of life for cancer patients." }
		],
		conditions: [
			{ title: "Breast Cancer", description: "Abnormal growth in breast tissue, often detected through screening." },
			{ title: "Lung Cancer", description: "Cancer of the lungs, commonly linked to smoking." },
			{ title: "Colorectal Cancer", description: "Cancer of the colon or rectum, often preventable with screening." },
			{ title: "Prostate Cancer", description: "Cancer in the prostate gland, common in older men." },
			{ title: "Leukemia", description: "Cancer of the blood and bone marrow." },
			{ title: "Skin Cancer", description: "Abnormal growth of skin cells, including melanoma." }
		],
		diagnosticTools: [
			{ title: "Advanced Cancer Screening", description: "Utilizing modern tools for early and accurate cancer detection." }
		],
		whyChooseUs: [
			"Compassionate Care: Holistic support for patients and families.",
			"Cutting-edge Treatments: Access to the latest oncology therapies.",
			"Personalized Plans: Individualized approach to cancer treatment."
		]
	},
	gastroenterology: {
		slug: "gastroenterology",
		name: "Gastroenterology",
		heroTitle: "Expert Gastroenterology Care",
		heroDescription: "Our Gastroenterology Department is dedicated to providing comprehensive and compassionate care for all disorders of the digestive system. We utilize advanced diagnostics and treatment methods to ensure optimal patient outcomes.",
		understanding: {
			title: "Understanding Gastroenterology",
			description: "Gastroenterology is the branch of medicine focused on the diagnosis, treatment, and prevention of diseases related to the digestive system. This includes the esophagus, stomach, small intestine, large intestine (colon), rectum, liver, gallbladder, and pancreas. Our specialists employ a holistic approach, integrating medical treatments, endoscopic procedures, and nutritional guidance."
		},
		services: [
			{ title: "Diagnostic & Therapeutic Endoscopy", description: "Advanced procedures like upper endoscopy, colonoscopy, and capsule endoscopy for precise diagnosis and minimally invasive treatment." },
			{ title: "Liver & Pancreatic Disease Management", description: "Comprehensive care for conditions such as hepatitis, cirrhosis, fatty liver disease, pancreatitis, and pancreatic cysts." },
			{ title: "Inflammatory Bowel Disease (IBD) Clinic", description: "Specialized, multidisciplinary care for Crohn’s disease and ulcerative colitis, including biologic therapies and long-term management." },
			{ title: "Gastrointestinal Oncology", description: "Diagnosis, staging, and management of cancers affecting the digestive tract, in collaboration with oncology specialists." },
			{ title: "Nutritional & Dietary Counseling", description: "Personalized diet plans and nutritional support to manage symptoms, promote healing, and improve overall digestive health." },
			{ title: "ERCP", description: "A specialized endoscopic procedure for diagnosing and treating conditions of the bile ducts and pancreatic duct." }
		],
		conditions: [
			{ title: "GERD", description: "Chronic acid reflux causing heartburn, regurgitation, and potential esophageal damage." },
			{ title: "IBS", description: "A common disorder affecting the large intestine, causing cramping, abdominal pain, bloating, gas, diarrhea or constipation." },
			{ title: "Hepatitis (A, B, C)", description: "Inflammation of the liver, often caused by viral infections, leading to liver damage." },
			{ title: "Gallstones", description: "Hardened deposits in the gallbladder that can cause severe pain, blockages, and inflammation." },
			{ title: "Pancreatitis", description: "Inflammation of the pancreas, which can range from mild discomfort to severe, life-threatening illness." },
			{ title: "Colorectal Polyps", description: "Growths in the colon and rectum that can sometimes develop into cancer, with a focus on early detection." }
		],
		diagnosticTools: [
			{ title: "Advanced GI Diagnostics", description: "Endoscopic and imaging tools for thorough digestive system evaluation." }
		],
		whyChooseUs: [
			"Holistic Approach: Combining medical, nutritional, and surgical expertise.",
			"Advanced Endoscopy: Minimally invasive procedures for faster recovery.",
			"Specialized Clinics: Dedicated centers for IBD and Liver care."
		]
	},
	pediatrics: {
		slug: "pediatrics",
		name: "Pediatrics",
		heroTitle: "Expert Pediatric Care",
		heroDescription: "Our Pediatrics Department is dedicated to providing compassionate, comprehensive care for infants, children, and adolescents, focusing on prevention, early intervention, and family support.",
		understanding: {
			title: "Understanding Pediatrics",
			description: "Pediatrics focuses on the medical care of children from birth through adolescence. Our pediatricians address a wide range of health issues, from routine check-ups to complex conditions, with a focus on prevention, early intervention, and family support."
		},
		services: [
			{ title: "Well-Child Visits", description: "Routine check-ups, vaccinations, and developmental screenings." },
			{ title: "Pediatric Emergency Care", description: "24/7 care for acute illnesses and injuries in children." },
			{ title: "Neonatal Care", description: "Specialized care for premature and critically ill newborns in our NICU." },
			{ title: "Pediatric Surgery", description: "Surgical interventions for congenital and acquired conditions." },
			{ title: "Child Psychology", description: "Support for behavioral and mental health challenges in children." },
			{ title: "Allergy & Immunology", description: "Diagnosis and treatment of allergies and immune disorders." }
		],
		conditions: [
			{ title: "Asthma", description: "Chronic respiratory condition causing wheezing and breathlessness." },
			{ title: "Ear Infections", description: "Common infections causing pain and hearing issues." },
			{ title: "ADHD", description: "Attention-deficit/hyperactivity disorder affecting focus and behavior." },
			{ title: "Diabetes", description: "Type 1 diabetes requiring insulin management in children." },
			{ title: "Food Allergies", description: "Immune responses to certain foods causing symptoms." },
			{ title: "Congenital Heart Defects", description: "Structural heart issues present at birth." }
		],
		diagnosticTools: [
			{ title: "Pediatric Assessment", description: "Age-appropriate diagnostic tools and screening for children." }
		],
		whyChooseUs: [
			"Compassionate Team: Experts dedicated to children's well-being.",
			"Child-Friendly Environment: Designed to make children feel safe and comfortable.",
			"Family-Centered Care: Involving parents in every step of the child's health journey."
		]
	},
	gynecology: {
		slug: "gynecology",
		name: "Gynecology",
		heroTitle: "Expert Gynecology Care",
		heroDescription: "Our Gynecology Department provides comprehensive care for women’s reproductive health, focusing on prevention, early detection, and advanced treatments for conditions affecting the female reproductive system.",
		understanding: {
			title: "Understanding Gynecology",
			description: "Gynecology focuses on the health of the female reproductive system, including the uterus, ovaries, and vagina. Our gynecologists address conditions like menstrual disorders, infertility, and gynecologic cancers, with a focus on prevention, early detection, and advanced treatments."
		},
		services: [
			{ title: "Well-Woman Exams", description: "Annual screenings, Pap smears, and breast exams for preventive care." },
			{ title: "Obstetrics", description: "Comprehensive prenatal, delivery, and postpartum care." },
			{ title: "Minimally Invasive Surgery", description: "Laparoscopic and robotic surgeries for fibroids and endometriosis." },
			{ title: "Infertility Treatment", description: "Fertility assessments and assisted reproductive technologies." },
			{ title: "Menopause Management", description: "Hormone therapy and lifestyle counseling for menopausal symptoms." },
			{ title: "Gynecologic Oncology", description: "Specialized care for ovarian, uterine, and cervical cancers." }
		],
		conditions: [
			{ title: "Fibroids", description: "Non-cancerous growths in the uterus causing pain or bleeding." },
			{ title: "Endometriosis", description: "Tissue growth outside the uterus causing pelvic pain." },
			{ title: "PCOS", description: "Hormonal disorder affecting ovulation and menstrual cycles." },
			{ title: "Urinary Incontinence", description: "Loss of bladder control, common in women." },
			{ title: "Cervical Cancer", description: "Cancer of the cervix, often preventable with screening." },
			{ title: "Menstrual Disorders", description: "Irregular or painful periods requiring management." }
		],
		diagnosticTools: [
			{ title: "Women's Health Screening", description: "Comprehensive diagnostic tools for reproductive and overall women's health." }
		],
		whyChooseUs: [
			"Specialized Expertise: Doctors focused on every stage of a woman's life.",
			"Advanced Technology: Minimally invasive and robotic surgical options.",
			"Holistic Care: Addressing physical and emotional aspects of women's health."
		]
	},
	urology: {
		slug: "urology",
		name: "Urology",
		heroTitle: "Expert Urology Care",
		heroDescription: "Our Urology Department provides expert care for disorders of the urinary tract and male reproductive system, utilizing advanced medical and surgical approaches for optimal outcomes.",
		understanding: {
			title: "Understanding Urology",
			description: "Urology focuses on the diagnosis and treatment of conditions affecting the urinary tract (kidneys, ureters, bladder, urethra) and male reproductive organs. Our urologists manage conditions like urinary incontinence, prostate cancer, and erectile dysfunction with a combination of medical and surgical approaches."
		},
		services: [
			{ title: "Kidney Stone Treatment", description: "Non-invasive and surgical options for kidney stone removal." },
			{ title: "Prostate Care", description: "Management of BPH and prostate cancer with medication or surgery." },
			{ title: "Bladder Health", description: "Treatment for incontinence, infections, and bladder cancer." },
			{ title: "Urologic Surgery", description: "Minimally invasive and robotic surgeries for urologic conditions." },
			{ title: "Male Infertility", description: "Evaluation and treatment for male reproductive issues." },
			{ title: "Pediatric Urology", description: "Care for congenital urologic conditions in children." }
		],
		conditions: [
			{ title: "Kidney Stones", description: "Hard deposits in the kidneys causing pain and obstruction." },
			{ title: "Prostate Cancer", description: "Cancer of the prostate gland, common in older men." },
			{ title: "Urinary Incontinence", description: "Loss of bladder control, affecting quality of life." },
			{ title: "BPH", description: "Enlarged prostate causing urinary symptoms." },
			{ title: "Bladder Infections", description: "Recurrent infections requiring medical management." },
			{ title: "Erectile Dysfunction", description: "Inability to maintain an erection, treatable with medication or surgery." }
		],
		diagnosticTools: [
			{ title: "Urological Evaluation", description: "Advanced diagnostic imaging and testing for urinary and reproductive health." }
		],
		whyChooseUs: [
			"Advanced Surgery: Expertise in robotic and minimally invasive urological procedures.",
			"Comprehensive Care: Treating both male and female urological conditions.",
			"Specialized Units: Dedicated centers for kidney stones and prostate health."
		]
	},
	"fertility-(ivf)": {
		slug: "fertility-(ivf)",
		name: "Fertility (IVF)",
		heroTitle: "Expert Fertility & IVF Solutions",
		heroDescription: "Our Fertility Department combines world-class clinical expertise with compassionate care to help you achieve your dream of parenthood through advanced reproductive technologies.",
		understanding: {
			title: "Understanding Fertility (IVF)",
			description: "In-Vitro Fertilization (IVF) and other assisted reproductive technologies (ART) are advanced medical procedures designed to help individuals and couples overcome infertility. Our specialists focus on personalized treatment plans, utilizing the latest in embryology and genetics to maximize success rates."
		},
		services: [
			{ title: "In-Vitro Fertilization (IVF)", description: "A multi-step process involving egg retrieval, fertilization in a lab, and embryo transfer." },
			{ title: "ICSI", description: "Intracytoplasmic Sperm Injection for cases of male factor infertility." },
			{ title: "Egg & Sperm Freezing", description: "Cryopreservation services to preserve fertility for future family planning." },
			{ title: "Donor Programs", description: "Comprehensive egg and sperm donor programs with rigorous screening." },
			{ title: "PGD/PGS", description: "Pre-implantation genetic diagnosis and screening to ensure healthy embryo selection." },
			{ title: "Surrogacy Coordination", description: "Legal and clinical support for gestational surrogacy journeys." }
		],
		conditions: [
			{ title: "Unexplained Infertility", description: "Inability to conceive despite normal diagnostic results." },
			{ title: "Endometriosis", description: "Tissue growth outside the uterus affecting fertility." },
			{ title: "Polycystic Ovary Syndrome (PCOS)", description: "Hormonal imbalances affecting regular ovulation." },
			{ title: "Male Factor Infertility", description: "Issues with sperm count, motility, or morphology." },
			{ title: "Advanced Maternal Age", description: "Challenges associated with conceiving later in life." },
			{ title: "Tubal Factor Infertility", description: "Blocked or damaged fallopian tubes preventing natural conception." }
		],
		diagnosticTools: [
			{ title: "Advanced Fertility Assessments", description: "Including hormonal profiling, 3D ultrasounds, and diagnostic laparoscopy." }
		],
		whyChooseUs: [
			"High Success Rates: Consistently achieving results above international benchmarks.",
			"Advanced Embryology Lab: State-of-the-art facilities for optimal embryo development.",
			"Compassionate Support: Dedicated counselors to guide you through the emotional journey.",
			"Personalized Protocols: Tailored medication and treatment cycles for every patient."
		]
	},
	"organ-transplant": {
		slug: "organ-transplant",
		name: "Organ Transplant",
		heroTitle: "Life-Saving Organ Transplantation",
		heroDescription: "Our Organ Transplant Department is a center of excellence for kidney, liver, and heart transplants, providing life-restoring procedures with world-class outcomes.",
		understanding: {
			title: "Understanding Organ Transplant",
			description: "Organ transplantation is a complex surgical procedure where a failing organ is replaced with a healthy one from a donor. Our multidisciplinary transplant team coordinates every aspect of the process, from donor matching and pre-transplant preparation to specialized post-operative care and long-term recovery."
		},
		services: [
			{ title: "Liver Transplant", description: "Comprehensive care for end-stage liver disease and acute liver failure." },
			{ title: "Kidney Transplant", description: "Living and deceased donor programs for chronic kidney disease patients." },
			{ title: "Heart Transplant", description: "Advanced surgical solutions for severe heart failure." },
			{ title: "Pancreas Transplant", description: "Specialized procedures often performed in conjunction with kidney transplants." },
			{ title: "Pre-Transplant Evaluation", description: "Rigorous medical and psychological assessment of transplant candidates." },
			{ title: "Post-Transplant Management", description: "Lifelong care and immunosuppression monitoring for transplant recipients." }
		],
		conditions: [
			{ title: "End-Stage Renal Disease (ESRD)", description: "Final stage of chronic kidney disease requiring transplant or dialysis." },
			{ title: "Cirrhosis & Liver Failure", description: "Severe liver damage often requiring a life-saving transplant." },
			{ title: "Congestive Heart Failure", description: "Inability of the heart to pump sufficiently, leading to the need for a transplant." },
			{ title: "Type 1 Diabetes", description: "In some cases, treatable through a pancreas transplant." },
			{ title: "Polycystic Kidney Disease", description: "Genetic disorder causing multiple cysts on the kidneys." }
		],
		diagnosticTools: [
			{ title: "Transplant Screening", description: "Comprehensive HLA typing, cross-matching, and advanced imaging for donor compatibility." }
		],
		whyChooseUs: [
			"Multidisciplinary Expertise: Surgeons, nephrologists, hepatologists, and coordinators working as one.",
			"Proven Outcomes: Survival rates that rival the top transplant centers globally.",
			"Waitlist Management: Efficient coordination and support throughout the waiting period.",
			"Advanced ICU Support: Dedicated transplant intensive care units for optimal recovery."
		]
	}
};
