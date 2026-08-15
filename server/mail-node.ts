/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The Node flavour of the mailer: everything server/mail.ts does, plus
 * SMTP.
 *
 * Node entry points import this one; the Cloudflare Worker imports mail.ts
 * directly. That single line of difference is what keeps node:net out of the
 * Worker bundle while leaving one implementation of everything else.
 */

import { sendMail, type OutgoingMail } from "./mail";
import { sendViaSmtp } from "./smtp";
import type { MailSettings } from "./settings";

export const sendMailNode = (mail: OutgoingMail, settings: MailSettings): Promise<void> =>
  sendMail(mail, settings, { smtp: sendViaSmtp });
