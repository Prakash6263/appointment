// Get Privacy Policy
exports.getPrivacyPolicy = (req, res) => {
  try {
    const privacyPolicy = {
      title: "Privacy Policy",
      lastUpdated: "2024-01-14",
      content: `
Privacy Policy

1. Introduction
We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

2. Information We Collect
We may collect information about you in a variety of ways. The information we may collect on the Site includes:

Personal Data: Email address, name, phone number, address, and other information you voluntarily provide when signing up or using our services.

Usage Data: Browser type, IP address, pages visited, time and date of visits, and other diagnostic data collected automatically.

3. How We Use Your Information
We use the information we collect in the following ways:

- To provide, operate, and maintain our service
- To improve, personalize, and expand our service
- To understand and analyze how you use our service
- To communicate with you, including for customer service and support
- To comply with legal obligations and resolve disputes

4. Security of Your Information
We use administrative, technical, and physical security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.

5. Contact Us
If you have any questions about this Privacy Policy, please contact us at: support@example.com

6. Changes to This Policy
We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
      `,
    }

    res.json({
      success: true,
      message: "Privacy Policy retrieved successfully",
      data: privacyPolicy,
    })
  } catch (error) {
    console.error("Get privacy policy error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve privacy policy",
    })
  }
}

// Get Terms and Conditions
exports.getTermsAndConditions = (req, res) => {
  try {
    const termsAndConditions = {
      title: "Terms and Conditions of Use",
      lastUpdated: "2024-01-14",
      content: `
Terms and Conditions of Use

1. Acceptance of Terms
By accessing and using this website and service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

2. Use License
Permission is granted to temporarily download one copy of the materials (information or software) on our site for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:

- Modifying or copying the materials
- Using the materials for any commercial purpose or for any public display
- Attempting to decompile or reverse engineer any software contained on the site
- Removing any copyright or other proprietary notations from the materials
- Transferring the materials to another person or "mirroring" the materials on any other server

3. Disclaimer
The materials on our site are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

4. Limitations
In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our site.

5. Accuracy of Materials
The materials appearing on our site could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our site are accurate, complete, or current. We may make changes to the materials contained on our site at any time without notice.

6. Links
We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user's own risk.

7. Modifications
We may revise these terms of service for our site at any time without notice. By using this site, you are agreeing to be bound by the then current version of these terms of service.

8. Governing Law
These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which the company is located, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.

9. Contact Us
If you have any questions about these Terms and Conditions, please contact us at: support@example.com
      `,
    }

    res.json({
      success: true,
      message: "Terms and Conditions retrieved successfully",
      data: termsAndConditions,
    })
  } catch (error) {
    console.error("Get terms and conditions error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve terms and conditions",
    })
  }
}
