import React, { useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import SEO from '../components/common/SEO';
import UpcomingEventsSection from '../components/home/UpcomingEventsSection';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-slate-50 min-h-screen py-16">
      <SEO
        title="Privacy Policy | Prime Time Research Media"
        description="Privacy Policy for Prime Time Research Media Private Limited. Read about how we collect, store, use, and protect your personal and sensitive information."
      />
      <PageContainer>
        <article className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 lg:p-16 max-w-4xl mx-auto">
          <header className="mb-12 border-b border-slate-100 pb-8 text-center">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-lg text-slate-500 font-medium">Prime Time Research Media Private Limited</p>
          </header>

          <div className="prose prose-lg prose-slate prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-sky-500 max-w-none">
            <p>
              At <strong>Prime Time Research Media Private Limited</strong>, we regard the lawful and correct treatment of personal and sensitive information as very significant to successful and efficient performance of our functions and to maintain confidence between those with whom it deals. To this end, PRIME TIME endeavors to conduct its business in compliance with the Information Technology Act, 2000 and the Information Technology (Reasonable Security and Procedures and Sensitive Personal Data or Information) Rules, 2011 (“Applicable Law”).
            </p>

            <p>
              This Privacy Policy applies to all directors, officers and employees, all branches, divisions and departments of Prime Time as well as its clients, customers and vendors. This Privacy Policy describes information that, as part of the normal operation of our services, we collect from you, how it is stored, used and protected.
            </p>

            <p>
              The purpose of this Privacy Policy is to outline and help you understand the various guidelines and procedures that are consistently followed by Prime Time when collecting, storing, utilizing, disclosing or otherwise dealing with any personal or sensitive information.
            </p>

            <p>
              PRIME TIME ensures that any information provided by you in electronic form or stored in electronic media which alone or in combination with other available information is capable of identifying you, will be protected. PRIME TIME may collect the following information from you, which includes both personal and non-personal information:
            </p>

            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>information that you provide by filling in our instruction forms for our various “LINKS” using the pages on PRIME TIME’s website;</li>
              <li>information about your personal details viz. name, address, telephone/mobile number, email etc.;</li>
              <li>personal information which you voluntarily disclose to us by e-mail or other means whether pursuant to a contract or otherwise;</li>
            </ul>

            <p>
              This Privacy Policy does not apply to any non-personal information disclosed by you or collected by PRIME TIME or any information that is in the public domain or furnished pursuant to law. PRIME TIME considers that privacy of your information is of utmost importance. PRIME TIME always leaves you with an option of not providing your personal information if you don’t want to. Further, you will have the following rights against the information provided to PRIME TIME:
            </p>

            <div className="space-y-6 my-8">
              <div>
                <strong className="text-slate-800 text-xl block mb-2">Consent before collection</strong>
                <p>
                  No information will be collected from you without giving you the option to give your consent. Voluntary provision of information by you, through e-mail or any other means or provision of information pursuant to a contract between you and PRIME TIME will be deemed as consent. In every case, if you wish not to provide PRIME TIME with the information, you will have an option of not providing the same.
                </p>
              </div>

              <div>
                <strong className="text-slate-800 text-xl block mb-2">Withdrawal of consent</strong>
                <p>
                  In case you intend to withdraw your consent for usage of any personal and sensitive information provided by you, we will respect your decision and not use such information. However, your intention of withdrawing consent for providing information to PRIME TIME should be in writing and in such a case PRIME TIME will be under no obligation to provide or continue providing the services for which such information was provided.
                </p>
              </div>

              <div>
                <strong className="text-slate-800 text-xl block mb-2">Review of information</strong>
                <p>
                  PRIME TIME also offers/permits the provider of any data or personal information an opportunity to review the data or personal information they have provided. You have a right to have deficient, incomplete, incorrect, unnecessary or outdated personal data reviewed, deleted or updated. In case of any inconsistency in such data or personal information the same is rectified to the best possible way.
                </p>
              </div>
            </div>

            <p>
              When any data or personal information is provided by you to PRIME TIME it is genuinely used by us only for the purpose for which it was provided including for responding to your enquiry and/or facilitating any services requested by you, supporting client/customer relationship and catering to your needs in an efficient way.
            </p>

            <p>
              PRIME TIME ensures that no data or information received by it will be disclosed to any third party without obtaining prior consent from you. In case, PRIME TIME intends to disclose any information provided by you, it will intimate you the reasons for such disclosure.
            </p>

            <p>
              PRIME TIME is under an obligation to assist the government, law enforcement and regulatory authorities. Therefore, in case of a written request from the government and other authorities, who are mandated under law to obtain personal information for the purpose of verification of identity, or for prevention, detection, investigation including cyber incidents, prosecution and punishment of offences, PRIME TIME reserves the right to share the information provided by you.
            </p>

            <p>
              Further, upon your consent or if its necessary for the performance of a contract with you, PRIME TIME may disclose your data or information to selected third parties who themselves offer the same or a higher level of protection than mandated under Applicable Law.
            </p>

            <p>
              PRIME TIME takes all reasonable steps to ensure that the information provided to it is stored in a secure environment protected from unauthorized access, modification, destruction or disclosure. PRIME TIME servers and workstations are protected by antivirus softwares which are updated on a daily basis to minimise the threats of any Virus, Malware or Trojan attacks and are located in secure data facilities with limited access to further increase security.
            </p>

            <p>
              However, please be informed that despite these reasonable efforts to protect personal data on our servers no method of transmission over the Internet is guaranteed to be secure. Therefore, while PRIME TIME strives to protect your personal data or information at all times, PRIME TIME cannot guarantee its absolute security and shall not be liable for any breach of security by an outside party.
            </p>

            <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="mb-2 font-bold text-slate-800">
                For any queries related to this Policy, correction of any personal information provided by you or for making a complaint about breach of privacy, you may please contact our legal advisors:
              </p>
              <p className="text-lg">
                <strong>Email:</strong> <a href="mailto:legal@primetimemedia.in" className="text-sky-600 hover:text-sky-700 transition-colors">legal@primetimemedia.in</a>
              </p>
            </div>

          </div>
        </article>
        <UpcomingEventsSection />
      </PageContainer>
    </main>
  );
};

export default PrivacyPolicy;
