/** @type {import('./vi.js').viTemplates extends infer T ? T : never} */
export const enTemplates = {
  post: {
    reviewed: {
      reporter: [
        {
          label: 'Post — report accepted (thank you)',
          body:
            'Thank you for reporting a {{targetLabel}}. After reviewing the content against our Community Guidelines and your stated reason («{{reason}}»), an admin confirmed the report was valid. The violating content has been addressed (hidden, removed, or restricted as appropriate). Your vigilance helps keep EngSocial safe and respectful for all learners.',
        },
        {
          label: 'Post — action taken',
          body:
            'Your {{targetLabel}} report is now marked Reviewed. We identified policy issues such as harassment, spam, or inappropriate language. Appropriate moderation action has been applied. We will continue monitoring if the behavior repeats. Thank you for supporting the EngSocial community.',
        },
        {
          label: 'Post — detailed update to reporter',
          body:
            'Report outcome for {{targetLabel}}: ACCEPTED. Admins reviewed context, severity, and community impact. Your reason: «{{reason}}». The content has been handled under our policies. If you see further violations, please report again with specific details.',
        },
      ],
      reported: [
        {
          label: 'Post — violation confirmed',
          body:
            'A report was filed regarding your {{targetLabel}}. After review, an admin confirmed a Community Guidelines violation (e.g. abusive language, harassment, spam, or inappropriate content). The post has been moderated. Please follow EngSocial standards; repeated violations may lead to suspension or account lock.',
        },
        {
          label: 'Post — formal warning',
          body:
            'EngSocial records that your {{targetLabel}} did not meet platform standards. This is an official notice following a valid report. Further violations may result in posting restrictions or account lock. Please share constructive, respectful content that supports our English-learning community.',
        },
        {
          label: 'Post — compliance reminder',
          body:
            'Report review outcome for your {{targetLabel}}: VIOLATION CONFIRMED. Content has been removed or restricted. You are responsible for complying with our Community Guidelines. See the Help link in this email if you need clarification or wish to appeal.',
        },
      ],
    },
    dismissed: {
      reporter: [
        {
          label: 'Post — report not accepted',
          body:
            'We reviewed your {{targetLabel}} report. Based on the content, context, and reason «{{reason}}», an admin found insufficient grounds for a policy violation. The report was dismissed. Thank you for caring about community safety — please report only when you believe there is a clear violation.',
        },
        {
          label: 'Post — insufficient grounds',
          body:
            'Your {{targetLabel}} report could not be acted on. If you have additional evidence (screenshots, links, detailed description), you may submit a new report. Avoid misuse of the reporting tool.',
        },
        {
          label: 'Post — guidance for reporters',
          body:
            'Outcome: NOT ACCEPTED for your {{targetLabel}} report. Admins encourage specific, good-faith reports with clear evidence of policy breaches.',
        },
      ],
      reported: [
        {
          label: 'Post — report dismissed',
          body:
            'Your {{targetLabel}} was reported, but after review an admin found no Community Guidelines violation or insufficient grounds for action. You may continue using EngSocial normally. If you believe the report was wrong, visit Help: {{helpUrl}}.',
        },
        {
          label: 'Post — no violation',
          body:
            'EngSocial confirms the report about your {{targetLabel}} was reviewed and NO VIOLATION was found. No further moderation action applies. See the Help link if you have questions about the reporting process.',
        },
        {
          label: 'Post — appeal information',
          body:
            'The report regarding your {{targetLabel}} was closed with a no-violation finding. For questions or concerns, visit {{helpUrl}}.',
        },
      ],
    },
  },
  message: {
    reviewed: {
      reporter: [
        {
          label: 'Message — valid report',
          body:
            'Thank you for reporting a {{targetLabel}}. Admins reviewed the message content and your reason «{{reason}}». The report was ACCEPTED and appropriate action was taken. Timely reports help keep chat safe on EngSocial.',
        },
        {
          label: 'Message — handled',
          body:
            'Your {{targetLabel}} report is Reviewed. We identified inappropriate chat behavior. Action has been taken (warning, restriction, or account measures as needed). Thank you for helping protect learners.',
        },
        {
          label: 'Message — reporter follow-up',
          body:
            'Outcome: VALID report for {{targetLabel}}. Reason noted: «{{reason}}». If harassment continues, block the user and report again with screenshots.',
        },
      ],
      reported: [
        {
          label: 'Message — chat violation',
          body:
            'An admin confirmed your {{targetLabel}} violated EngSocial policies (harassment, abusive language, spam, etc.). Please communicate respectfully; repeated violations may lead to account lock.',
        },
        {
          label: 'Message — behavior warning',
          body:
            'Official warning: your {{targetLabel}} behavior was reported and confirmed. Avoid threats, insults, or unwanted content in conversations.',
        },
        {
          label: 'Message — next steps',
          body:
            'Report outcome for your {{targetLabel}}: VIOLATION. See the Help link in this email for chat rules on EngSocial.',
        },
      ],
    },
    dismissed: {
      reporter: [
        {
          label: 'Message — report dismissed',
          body:
            'Your {{targetLabel}} report was not accepted after review of «{{reason}}» and message context. You may report again with more evidence.',
        },
        {
          label: 'Message — insufficient grounds',
          body:
            'EngSocial could not act on your {{targetLabel}} report. Some heated discussion may still be within policy. Block users if you feel unsafe and report with details.',
        },
        {
          label: 'Message — reporter guidance',
          body:
            'Outcome: NOT ACCEPTED for {{targetLabel}}. Please report clear policy violations, not personal disagreements.',
        },
      ],
      reported: [
        {
          label: 'Message — no violation',
          body:
            'A report about your {{targetLabel}} was reviewed and no violation was found. Continue chatting normally. If the report was wrong: {{helpUrl}}.',
        },
        {
          label: 'Message — report closed',
          body:
            'EngSocial closed the report on your {{targetLabel}} with no further action. Help link attached if needed.',
        },
        {
          label: 'Message — support',
          body:
            'The report about your {{targetLabel}} was dismissed. Questions? Visit {{helpUrl}}.',
        },
      ],
    },
  },
  conversation: {
    reviewed: {
      reporter: [
        {
          label: 'Group chat — valid report',
          body:
            'Thank you for reporting a {{targetLabel}}. Admins reviewed group activity and reason «{{reason}}». Report ACCEPTED; we intervened (member warnings, group restrictions, or other measures as appropriate).',
        },
        {
          label: 'Group chat — handled',
          body:
            'Your {{targetLabel}} report is Reviewed. We identified group policy issues (mass spam, toxic content, harassment). Thank you for reporting promptly.',
        },
        {
          label: 'Group chat — reporter update',
          body:
            'Outcome: VALID for {{targetLabel}}. Reason: «{{reason}}». Report again with screenshots if problems continue.',
        },
      ],
      reported: [
        {
          label: 'Group chat — violation',
          body:
            'An admin confirmed your {{targetLabel}} violated Community Guidelines. Action was taken on the group and/or members. Repeated issues may affect your personal account.',
        },
        {
          label: 'Group chat — member warning',
          body:
            'Warning: behavior in {{targetLabel}} was reported and confirmed. Do not share abusive, spam, or harassing content in groups.',
        },
        {
          label: 'Group chat — consequences',
          body:
            'Report on {{targetLabel}}: VIOLATION confirmed. See Help link for group chat rules.',
        },
      ],
    },
    dismissed: {
      reporter: [
        {
          label: 'Group chat — dismissed',
          body:
            'Your {{targetLabel}} report was not accepted after reviewing «{{reason}}» and group content. Submit again with stronger evidence if needed.',
        },
        {
          label: 'Group chat — insufficient grounds',
          body:
            'EngSocial could not act on your {{targetLabel}} report. Thank you for your concern.',
        },
        {
          label: 'Group chat — reporter tips',
          body:
            'Outcome: NOT ACCEPTED for {{targetLabel}}. Include specific times and examples when re-reporting.',
        },
      ],
      reported: [
        {
          label: 'Group chat — no violation',
          body:
            'Report on {{targetLabel}} involving you was dismissed — no violation found. Wrong report? {{helpUrl}}.',
        },
        {
          label: 'Group chat — closed',
          body:
            'No further action on {{targetLabel}} after review. Help link attached.',
        },
        {
          label: 'Group chat — appeal',
          body:
            'Report about {{targetLabel}} was rejected. Visit {{helpUrl}} for support.',
        },
      ],
    },
  },
  user: {
    reviewed: {
      reporter: [
        {
          label: 'User account — valid report',
          body:
            'Thank you for reporting a {{targetLabel}}. Admins reviewed the profile/behavior and reason «{{reason}}». Report ACCEPTED; measures may include warnings, suspension, or account lock depending on severity.',
        },
        {
          label: 'User account — handled',
          body:
            'Your {{targetLabel}} report is Reviewed. We identified policy violations (impersonation, harassment, spam, abuse). Thank you for helping keep EngSocial safe.',
        },
        {
          label: 'User account — reporter update',
          body:
            'Outcome: VALID for {{targetLabel}}. Reason: «{{reason}}». Block and report again with evidence if behavior continues.',
        },
      ],
      reported: [
        {
          label: 'User account — violation confirmed',
          body:
            'An admin confirmed your {{targetLabel}} violated Community Guidelines. Restrictions may apply (suspension, lock, content removal). Serious or repeated violations escalate further.',
        },
        {
          label: 'User account — formal warning',
          body:
            'Official warning following a valid report on your {{targetLabel}}. Stop harassment, spam, or impersonation. Admins are monitoring your account.',
        },
        {
          label: 'User account — consequences',
          body:
            'Report on your {{targetLabel}}: VIOLATION. See Help link if you wish to understand policies or appeal.',
        },
      ],
    },
    dismissed: {
      reporter: [
        {
          label: 'User account — dismissed',
          body:
            'Your {{targetLabel}} report was not accepted after review of «{{reason}}». Report again with clearer evidence if applicable.',
        },
        {
          label: 'User account — insufficient grounds',
          body:
            'EngSocial could not act on your {{targetLabel}} report. Avoid reports driven by personal conflict alone.',
        },
        {
          label: 'User account — reporter guidance',
          body:
            'Outcome: NOT ACCEPTED for {{targetLabel}}. Specific behavior descriptions help admins act faster.',
        },
      ],
      reported: [
        {
          label: 'User account — no violation',
          body:
            'Report on your {{targetLabel}} was reviewed — no violation found. Continue using EngSocial. Wrong report? {{helpUrl}}.',
        },
        {
          label: 'User account — closed',
          body:
            'No further action after reviewing {{targetLabel}}. Help link attached.',
        },
        {
          label: 'User account — support',
          body:
            'Report about your {{targetLabel}} was dismissed. Visit {{helpUrl}} with questions.',
        },
      ],
    },
  },
}
