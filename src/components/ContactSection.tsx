import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check, Github, Linkedin, Youtube, Calendar, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeveloperProfile, openEmailClient } from '../data/portfolioData';
import { WhatsAppLogo, TikTokLogo } from './TechLogos';

interface ContactSectionProps {
  profile: DeveloperProfile;
  onOpenBooking?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ profile, onOpenBooking }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(profile.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('https://formsubmit.co/ajax/ah.elbialy.dev@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          subject: subject || 'New Portfolio Inquiry from ' + name,
          message,
          _subject: `New Message from Portfolio: ${subject || name}`,
        })
      });

      if (!response.ok) {
        throw new Error('FormSubmit error');
      }

      setIsSubmitting(false);
      setSubmitted(true);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8 }
      });
      setTimeout(() => {
        setSubmitted(false);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }, 4000);
    } catch {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-black/10 dark:border-white/5">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Mail size={13} />
          <span>Direct Communication</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight title-contrast">
          Let&apos;s Build Something Great Together
        </h2>
        <p className="text-slate-600 dark:text-gray-400 mt-2 text-sm sm:text-base body-contrast">
          Have a mobile application project, a Flutter development role, or questions regarding Clean Architecture? Reach out directly.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Contact Form */}
        <div className="lg:col-span-7 card-techno rounded-3xl p-5 sm:p-8 bg-white dark:bg-[#131522] border border-black/10 dark:border-white/10">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1 title-contrast">
            Send a Direct Message
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-6">Replies are usually sent promptly within 24 hours.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1">Your Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Mobile project inquiry / Flutter role"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1">Message *</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your app concept, specifications, or inquiry..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting || submitted}
                className="w-full sm:flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                {submitted ? (
                  <>
                    <Check size={16} />
                    <span>Message Sent Successfully!</span>
                  </>
                ) : isSubmitting ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              {onOpenBooking && (
                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600/15 to-cyan-500/15 hover:from-blue-600 hover:to-cyan-500 hover:text-white text-blue-700 dark:text-cyan-300 font-bold text-xs sm:text-sm border border-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[44px]"
                >
                  <Calendar size={15} />
                  <span>Book Meeting</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Contact Channels Info */}
        <div className="lg:col-span-5 flex flex-col justify-between card-techno rounded-3xl p-5 sm:p-8 bg-white dark:bg-[#131522] border border-black/10 dark:border-white/10">
          <div className="space-y-5">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1 title-contrast">
                Direct Channels
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">Available across professional channels and phone.</p>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                  <Mail size={18} />
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="text-xs text-slate-500 dark:text-gray-400">Primary Email</div>
                  <div className="font-mono text-xs sm:text-sm text-slate-900 dark:text-white font-semibold truncate mt-0.5">
                    {profile.email}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => openEmailClient(profile.email, 'Mobile App Project Inquiry - Flutter Developer')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-cyan-300 font-semibold text-[11px] border border-blue-500/25 transition-all cursor-pointer min-h-[32px]"
                    >
                      <Mail size={12} />
                      <span>Send Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-gray-300 text-[11px] font-medium transition-colors cursor-pointer min-h-[32px]"
                    >
                      <Copy size={11} />
                      <span>{copiedEmail ? '✓ Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-gray-400">Direct WhatsApp</div>
                  <a
                    href="https://wa.me/201022121573"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition-colors block mt-0.5"
                    title="Open WhatsApp Chat directly"
                  >
                    {profile.phone}
                  </a>
                  <span className="text-[11px] text-slate-500 dark:text-gray-500 mt-0.5 inline-block">Direct messaging on WhatsApp</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-gray-400">Location & Timezone</div>
                  <div className="text-xs sm:text-sm text-slate-900 dark:text-white font-semibold mt-0.5">
                    {profile.location}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-gray-500 mt-0.5 inline-block">GMT+2 (Egypt Standard Time)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Icons row */}
          <div className="pt-5 border-t border-black/5 dark:border-white/5">
            <div className="text-xs text-slate-500 dark:text-gray-400 mb-2.5">Connect on Social Platforms:</div>
            <div className="flex items-center gap-2">
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="GitHub"
              >
                <Github size={17} />
              </a>
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-blue-600/20 text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="LinkedIn"
              >
                <Linkedin size={17} />
              </a>
              <a
                href={profile.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-red-600/20 text-slate-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="YouTube"
              >
                <Youtube size={17} />
              </a>
              <a
                href={profile.tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-pink-600/20 text-slate-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 text-xs font-semibold transition-colors min-h-[40px] flex items-center justify-center"
                title="TikTok"
              >
                <TikTokLogo size={14} />
              </a>
              <a
                href="https://wa.me/201022121573"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-emerald-600/20 text-slate-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="WhatsApp Direct Chat"
              >
                <WhatsAppLogo size={17} />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
