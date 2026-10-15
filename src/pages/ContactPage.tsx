import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Check, Globe2, Loader2, Mail, MapPin, MessageCircle, Phone, RotateCcw, Send } from 'lucide-react'
import { Footer } from '../components/layout/Footer'
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '../components/ui/SocialIcons'
import { useAuth } from '../hooks/useAuth'
import { errorMessage } from '../lib/http/apiClient'
import { CONTACT_SUBJECTS, contactRepository, type ContactInput } from '../repositories/contactRepository'
import { fullName } from '../utils/format'
import '../styles/catalog.css'

type Fields = { fullName: string; email: string; phone: string; orderNumber: string; subject: ContactInput['subject']; message: string; consent: boolean }
type Errors = Partial<Record<keyof Fields, string>>

const PHONE = /^\+?[0-9 ()-]{7,20}$/
const ORDER = /^#?BSC-[0-9A-Z]{5,8}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MESSAGE_MAX = 5000

function validate(fields: Fields): Errors {
  const errors: Errors = {}
  if (fields.fullName.trim().length < 2) errors.fullName = 'Please enter your full name.'
  if (!EMAIL.test(fields.email.trim())) errors.email = 'Enter a valid email address.'
  if (!PHONE.test(fields.phone.trim())) errors.phone = 'Enter a valid phone number, e.g. +91 98765 43210.'
  if (fields.orderNumber.trim() && !ORDER.test(fields.orderNumber.trim().toUpperCase())) errors.orderNumber = 'Order numbers look like BSC-7KQ2M9XA.'
  if (fields.message.trim().length < 10) errors.message = 'Tell us a little more (at least 10 characters).'
  if (!fields.consent) errors.consent = 'Please accept the privacy policy so we can reply.'
  return errors
}

function ContactForm() {
  const { user } = useAuth()
  const blank = (): Fields => ({ fullName: fullName(user), email: user?.email ?? '', phone: user?.phone ?? '', orderNumber: '', subject: CONTACT_SUBJECTS[0], message: '', consent: false })
  const [fields, setFields] = useState<Fields>(blank)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
    if (status === 'sent') setStatus('idle')
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const found = validate(fields)
    setErrors(found)
    setServerError(null)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      event.currentTarget.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }
    setStatus('sending')
    try {
      const orderNumber = fields.orderNumber.trim().toUpperCase().replace(/^#/, '')
      await contactRepository.send({
        fullName: fields.fullName.trim(),
        email: fields.email.trim(),
        phone: fields.phone.trim(),
        orderNumber: orderNumber || undefined,
        subject: fields.subject,
        message: fields.message.trim(),
        consent: fields.consent,
      })
      setStatus('sent')
      setFields(blank())
      toast.success('Message sent successfully!', { description: 'Thank you! We usually reply within one business day.' })
    } catch (error) {
      const message = errorMessage(error)
      setStatus('idle')
      setServerError(message)
      toast.error('Could not send your message', { description: message })
    }
  }

  const fieldProps = (key: keyof Fields) => ({
    name: key,
    'aria-invalid': Boolean(errors[key]),
    'aria-describedby': errors[key] ? `contact-${key}-error` : undefined,
  })
  const error = (key: keyof Fields) => errors[key] && <span className="contact-field-error" id={`contact-${key}-error`} role="alert">{errors[key]}</span>

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <div className="contact-form-heading"><div><span>Send a note</span><h2>How can we help?</h2></div><Mail size={25} /></div>
      <div className="contact-form-layout">
        <aside className="contact-form-aside">
          <span className="contact-aside-icon"><MessageCircle size={20} /></span>
          <p>Personal support</p>
          <h3>Let’s start a good conversation.</h3>
          <p>Whether it’s an order, a gifting idea or a wholesale partnership, our team will point you in the right direction.</p>
          <div className="contact-promises"><span><Check size={13} /> Usually replies within one business day</span><span><Check size={13} /> Helpful humans, never automated scripts</span><span><Check size={13} /> Secure and private communication</span></div>
          <a href="tel:+918807783007"><Phone size={15} /><span><small>Prefer to talk?</small><b>+91 88077 83007</b></span></a>
        </aside>
        <div className="contact-form-fields">
          {status === 'sent' && (
            <div className="contact-success" role="status">
              <Check size={18} />
              <div><b>Thanks — your message is on its way.</b><span>Our team usually replies within one business day.</span></div>
              <button type="button" onClick={() => setStatus('idle')} aria-label="Dismiss"><RotateCcw size={13} /> New message</button>
            </div>
          )}
          <div className="contact-form-grid">
            <label>Full name<input {...fieldProps('fullName')} autoComplete="name" maxLength={120} placeholder="Your name" value={fields.fullName} onChange={(event) => set('fullName', event.target.value)} />{error('fullName')}</label>
            <label>Email address<input {...fieldProps('email')} type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" value={fields.email} onChange={(event) => set('email', event.target.value)} />{error('email')}</label>
            <label>Phone number<input {...fieldProps('phone')} type="tel" autoComplete="tel" maxLength={20} placeholder="+91 98765 43210" value={fields.phone} onChange={(event) => set('phone', event.target.value)} />{error('phone')}</label>
            <label>Order number <small>Optional</small><input {...fieldProps('orderNumber')} placeholder="BSC-7KQ2M9XA" maxLength={13} value={fields.orderNumber} onChange={(event) => set('orderNumber', event.target.value.toUpperCase())} />{error('orderNumber')}</label>
            <label className="contact-span-2">Subject<select {...fieldProps('subject')} value={fields.subject} onChange={(event) => set('subject', event.target.value as Fields['subject'])}>{CONTACT_SUBJECTS.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
            <label className="contact-span-2">Message<textarea {...fieldProps('message')} maxLength={MESSAGE_MAX} placeholder="How can we help you?" value={fields.message} onChange={(event) => set('message', event.target.value)} /><span className="contact-field-meta">{error('message') ?? <span />}<small>{fields.message.length}/{MESSAGE_MAX}</small></span></label>
          </div>
          <label className="contact-consent"><input {...fieldProps('consent')} type="checkbox" checked={fields.consent} onChange={(event) => set('consent', event.target.checked)} /> <span>I agree to the Privacy Policy and terms of service regarding data handling.</span></label>
          {error('consent')}
          {serverError && <p className="contact-field-error mt-3" role="alert">{serverError}</p>}
          <button className={status === 'sent' ? 'is-submitted' : ''} type="submit" disabled={status === 'sending'} aria-busy={status === 'sending'}>
            {status === 'sending' ? <><Loader2 className="animate-spin" size={16} /> Sending…</> : status === 'sent' ? <><Check size={16} /> Message sent successfully</> : <><Send size={15} /> Send message</>}
          </button>
        </div>
      </div>
    </form>
  )
}

export function ContactPage() {
  return (
    <main className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-image" aria-hidden="true" />
        <div className="contact-hero-content">
          <nav aria-label="Breadcrumb"><a href="#home">Home</a><span>/</span><b>Contact</b></nav>
          <span className="contact-eyebrow"><MessageCircle size={14} /> We’re listening</span>
          <h1>Contact Us</h1>
          <p>We’re here to help. Reach out with your questions, orders or business enquiries.</p>
          <div><a href="tel:+918807783007"><Phone size={13} /> Call now</a><a href="https://wa.me/918807783007" target="_blank" rel="noreferrer"><WhatsAppIcon size={14} /> WhatsApp</a></div>
        </div>
      </section>

      <div className="contact-shell">
        <ContactForm />

        <section className="contact-cards" aria-label="Contact information">
          <article><div className="contact-card-top"><span><Mail size={21} /></span><small>Direct lines</small></div><h2>Talk to our team</h2><p>Questions about a jar or an existing order? We’re ready to help.</p><div className="contact-card-links"><a href="mailto:hello@bossco.com"><Mail size={13} /> hello@bossco.com</a><a href="tel:+918807783007"><Phone size={13} /> +91 88077 83007</a></div><b className="contact-status"><i /> Online today</b></article>
          <article><div className="contact-card-top"><span><MapPin size={21} /></span><small>Our home</small></div><h2>Visit Bossco</h2><address>5D/12B Pasuvanthanal Road<br />Kovilpatti, Tamil Nadu<br />628501, India</address><a className="contact-card-direction" href="https://www.google.com/maps/search/?api=1&amp;query=Kovilpatti%2C%20Tamil%20Nadu%20628501" target="_blank" rel="noreferrer">Open directions <Send size={12} /></a></article>
          <article><div className="contact-card-top"><span><Globe2 size={21} /></span><small>Stay connected</small></div><h2>Follow the harvest</h2><p>New launches, serving ideas and glimpses from behind the scenes.</p><div className="contact-socials"><a href="https://wa.me/918807783007" aria-label="WhatsApp"><WhatsAppIcon size={18} /></a><a href="https://instagram.com" aria-label="Instagram"><InstagramIcon size={18} /></a><a href="https://facebook.com" aria-label="Facebook"><FacebookIcon size={18} /></a></div><b className="contact-social-label">@bossconaturals</b></article>
        </section>

        <section className="contact-location-section">
          <header><div><span><MapPin size={14} /> Find us</span><h2>Come say hello in Kovilpatti.</h2></div><p>We’d love to welcome you. Call ahead if you’re visiting for a specific product or wholesale conversation.</p></header>
          <div className="contact-map"><iframe title="Bossco location in Kovilpatti" src="https://www.openstreetmap.org/export/embed.html?bbox=77.82%2C9.12%2C77.91%2C9.22&amp;layer=mapnik&amp;marker=9.1674%2C77.8767" loading="lazy" /><aside className="map-details"><span className="map-pin"><MapPin size={20} /></span><small>Bossco Naturals</small><h3>Kovilpatti store</h3><address>5D/12B Pasuvanthanal Road<br />Kovilpatti, Tamil Nadu 628501</address><dl><div><dt>Mon – Sat</dt><dd>9:30 AM – 7:00 PM</dd></div><div><dt>Sunday</dt><dd>By appointment</dd></div></dl><a href="https://www.google.com/maps/search/?api=1&amp;query=Kovilpatti%2C%20Tamil%20Nadu%20628501" target="_blank" rel="noreferrer">Get directions <Send size={13} /></a></aside></div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
