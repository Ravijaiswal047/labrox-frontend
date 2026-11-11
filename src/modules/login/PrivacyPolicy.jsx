import React from "react";
import "./TermsOfService.css";

const PrivacyPolicy = () => {
  return (
    <div className="terms-of-service">
      <h1>Privacy Policy</h1>

      <section>
        <h2>SECTION 1 - WHAT DO WE DO WITH YOUR INFORMATION?</h2>
        <p>
          When you purchase something from our store, as part of the buying and
          selling process, we collect the personal information you give us such
          as your name, address, and email address. When you browse our store,
          we also automatically receive your computer’s internet protocol (IP)
          address to help us learn about your browser and operating system.
        </p>
        <p>
          Email marketing (if applicable): With your permission, we may send you
          emails about our store, new products, and other updates.
        </p>
      </section>

      <section>
        <h2>SECTION 2 - CONSENT</h2>
        <p>
          <strong>How do you get my consent?</strong>
          <br />
          When you provide us with personal information to complete a
          transaction, verify your credit card, place an order, arrange for
          delivery, or return a purchase, we imply that you consent to our
          collecting it and using it for that specific reason only. If we ask
          for your personal information for a secondary reason, like marketing,
          we will either ask you directly for your expressed consent or provide
          you with an opportunity to say no.
        </p>
        <p>
          <strong>How do I withdraw my consent?</strong>
          <br />
          If after you opt-in, you change your mind, you may withdraw your
          consent for us to contact you, for the continued collection, use, or
          disclosure of your information, at any time by contacting us at{" "}
          <em>[support@labrox.com]</em>
          or mailing us at:{" "}
          <em>[G-19, G Block, Sector 6, Noida, Uttar Pradesh 201301]</em>.
        </p>
      </section>

      <section>
        <h2>SECTION 3 - DISCLOSURE</h2>
        <p>
          We may disclose your personal information if we are required by law to
          do so or if you violate our Terms of Service.
        </p>
      </section>

      <section>
        <h2>SECTION 4 - PAYMENT</h2>
        <p>
          We use Razorpay for processing payments. We/Razorpay do not store your
          card data on their servers. The data is encrypted through the Payment
          Card Industry Data Security Standard (PCI-DSS) when processing
          payment. Your purchase transaction data is only used as long as
          necessary to complete your transaction, after which it is not saved.
        </p>
        <p>
          For more insight, you may also want to read the terms and conditions
          of Razorpay on{" "}
          <a
            href="https://razorpay.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://razorpay.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2>SECTION 5 - THIRD-PARTY SERVICES</h2>
        <p>
          In general, the third-party providers we use will only collect, use,
          and disclose your information to the extent necessary to allow them to
          perform the services they provide to us. For these providers, we
          recommend that you read their privacy policies so you can understand
          how your personal information will be handled.
        </p>
        <p>
          Once you leave our store’s website or are redirected to a third-party
          website or application, you are no longer governed by this Privacy
          Policy or our website’s Terms of Service.
        </p>
      </section>

      <section>
        <h2>SECTION 6 - SECURITY</h2>
        <p>
          To protect your personal information, we take reasonable precautions
          and follow industry best practices to make sure it is not
          inappropriately lost, misused, accessed, disclosed, altered, or
          destroyed.
        </p>
      </section>

      <section>
        <h2>SECTION 7 - COOKIES</h2>
        <p>
          We use cookies to maintain the session of your user. It is not used to
          personally identify you on other websites.
        </p>
      </section>

      <section>
        <h2>SECTION 8 - AGE OF CONSENT</h2>
        <p>
          By using this site, you represent that you are at least the age of
          majority in your state or province of residence, or that you are the
          age of majority and have given us your consent to allow any of your
          minor dependents to use this site.
        </p>
      </section>

      <section>
        <h2>SECTION 9 - CHANGES TO THIS PRIVACY POLICY</h2>
        <p>
          We reserve the right to modify this privacy policy at any time, so
          please review it frequently. If we make material changes, we will
          notify you so that you are aware of what information we collect, how
          we use it, and under what circumstances, if any, we use and/or
          disclose it.
        </p>
        <p>
          If our store is acquired or merged with another company, your
          information may be transferred to the new owners so that we may
          continue to sell products to you.
        </p>
      </section>

      <section>
        <h2>QUESTIONS AND CONTACT INFORMATION</h2>
        <p>
          If you would like to: access, correct, amend, or delete any personal
          information we have about you, register a complaint, or simply want
          more information, contact at <em>[support@labrox.com]</em>
          or by mail at:{" "}
          <em>[G-19, G Block, Sector 6, Noida, Uttar Pradesh 201301]</em>.
        </p>
        {/* <p>
          <strong>Re: Privacy Compliance Officer</strong>
        </p>
        <p>[622 Manglam Electronic Market Jaipur Rajasthan India 302001]</p> */}
      </section>
    </div>
  );
};

export default PrivacyPolicy;
