import {
  Bell,
  Building,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  Image as ImageIcon,
  Mail,
  Plus,
  Save,
  Send,
  Store,
  Tag,
  Truck,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  useGetSettingsQuery,
  useSendTestEmailMutation,
  useUpdateSettingsMutation,
  useUploadFaviconMutation,
  useUploadStoreLogoMutation,
} from '../../features/admin/adminApi'

export function AdminSettingsPage() {
  const { data: serverSettings } = useGetSettingsQuery()
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation()
  const [uploadStoreLogo, { isLoading: isUploadingLogo }] = useUploadStoreLogoMutation()
  const [uploadFavicon, { isLoading: isUploadingFavicon }] = useUploadFaviconMutation()
  const [sendTestEmail, { isLoading: isTesting }] = useSendTestEmailMutation()

  // Form State — Bossco defaults; server DB values overwrite on load.
  const [storeName, setStoreName] = useState('Bossco Naturals')
  const [contactEmail, setContactEmail] = useState('hello@bossco.local')
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210')
  const [storeAddress, setStoreAddress] = useState(
    'Bossco Naturals, Kochi, Kerala, India'
  )

  const [taxId, setTaxId] = useState('GSTIN32AAAAA0000A1Z5')
  const [registrationDetails, setRegistrationDetails] = useState(
    'Registered as Bossco Naturals Private Limited.'
  )
  const [currency, setCurrency] = useState('INR (₹) - Indian Rupee')
  const [timeZone, setTimeZone] = useState('(GMT+05:30) India Standard Time')

  const [standardDeliveryCharge, setStandardDeliveryCharge] = useState('49.00')
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('999.00')
  const [regions, setRegions] = useState(['Kerala', 'Tamil Nadu', 'Karnataka'])
  const [newRegion, setNewRegion] = useState('')
  const [showAddRegion, setShowAddRegion] = useState(false)

  // Tax Configuration
  const [enableTax, setEnableTax] = useState(true)
  const [defaultTaxRate, setDefaultTaxRate] = useState('18')
  const [productPriceType, setProductPriceType] = useState<'inclusive' | 'exclusive'>('inclusive')

  // Order Settings
  const [minOrderVal, setMinOrderVal] = useState('0')
  const [maxOrderVal, setMaxOrderVal] = useState('100000')
  const [allowCod, setAllowCod] = useState(true)
  const [cancellationWindow, setCancellationWindow] = useState('Up to 30 minutes after order')

  // Payment Methods
  const [upiEnabled, setUpiEnabled] = useState(true)
  const [cardEnabled, setCardEnabled] = useState(true)
  const [netBankingEnabled, setNetBankingEnabled] = useState(true)
  const [codEnabled, setCodEnabled] = useState(true)

  // Email & SMTP Configuration — Gmail SMTP via backend only.
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPassword, setSmtpPassword] = useState('')
  const [smtpFrom, setSmtpFrom] = useState('Bossco Naturals <no-reply@bossco.local>')
  const [smtpSecure, setSmtpSecure] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [testEmailAddress, setTestEmailAddress] = useState('')

  // Populate from server settings when loaded
  useEffect(() => {
    if (serverSettings) {
      if (serverSettings.storeName) setStoreName(serverSettings.storeName)
      if (serverSettings.contactEmail) setContactEmail(serverSettings.contactEmail)
      if (serverSettings.phone) setPhoneNumber(serverSettings.phone)
      if (serverSettings.storeAddress) setStoreAddress(serverSettings.storeAddress)

      if (serverSettings.taxId) setTaxId(serverSettings.taxId)
      if (serverSettings.registrationDetails) setRegistrationDetails(serverSettings.registrationDetails)
      if (serverSettings.currency) setCurrency(serverSettings.currency)
      if (serverSettings.timeZone) setTimeZone(serverSettings.timeZone)

      if (serverSettings.standardDeliveryCharge)
        setStandardDeliveryCharge(String(serverSettings.standardDeliveryCharge))
      if (serverSettings.freeDeliveryThreshold)
        setFreeDeliveryThreshold(String(serverSettings.freeDeliveryThreshold))
      if (serverSettings.deliveryRegions) setRegions(serverSettings.deliveryRegions)

      if (serverSettings.enableTax !== undefined) setEnableTax(serverSettings.enableTax)
      if (serverSettings.defaultTaxRate !== undefined)
        setDefaultTaxRate(String(serverSettings.defaultTaxRate))
      if (serverSettings.productPriceType) setProductPriceType(serverSettings.productPriceType)

      if (serverSettings.minOrderValue !== undefined)
        setMinOrderVal(String(serverSettings.minOrderValue))
      if (serverSettings.maxOrderValue !== undefined)
        setMaxOrderVal(String(serverSettings.maxOrderValue))
      if (serverSettings.allowCod !== undefined) setAllowCod(serverSettings.allowCod)

      if (serverSettings.paymentMethods) {
        setUpiEnabled(serverSettings.paymentMethods.upi)
        setCardEnabled(serverSettings.paymentMethods.card)
        setNetBankingEnabled(serverSettings.paymentMethods.netBanking)
        setCodEnabled(serverSettings.paymentMethods.cod)
      }

      if (serverSettings.mail) {
        setSmtpHost(serverSettings.mail.host || 'smtp.gmail.com')
        setSmtpPort(String(serverSettings.mail.port || 587))
        setSmtpUser(serverSettings.mail.user || '')
        setSmtpPassword(serverSettings.mail.password || '')
        setSmtpFrom(serverSettings.mail.from || 'Bossco Naturals <no-reply@bossco.local>')
        setSmtpSecure(Boolean(serverSettings.mail.secure))
      }
    }
  }, [serverSettings])

  const handleAddRegion = () => {
    if (!newRegion.trim()) return
    if (!regions.includes(newRegion.trim())) {
      setRegions([...regions, newRegion.trim()])
    }
    setNewRegion('')
    setShowAddRegion(false)
  }

  const handleRemoveRegion = (regionToRemove: string) => {
    setRegions(regions.filter((r) => r !== regionToRemove))
  }

  const handleSaveAll = async () => {
    try {
      await updateSettings({
        storeName,
        contactEmail,
        phone: phoneNumber,
        storeAddress,
        taxId,
        registrationDetails,
        currency,
        timeZone,
        standardDeliveryCharge: parseFloat(standardDeliveryCharge) || 0,
        freeDeliveryThreshold: parseFloat(freeDeliveryThreshold) || 0,
        deliveryRegions: regions,
        enableTax,
        defaultTaxRate: parseFloat(defaultTaxRate) || 0,
        productPriceType,
        minOrderValue: parseFloat(minOrderVal) || 0,
        maxOrderValue: parseFloat(maxOrderVal) || 0,
        allowCod,
        paymentMethods: {
          upi: upiEnabled,
          card: cardEnabled,
          netBanking: netBankingEnabled,
          cod: codEnabled,
        },
        mail: {
          host: smtpHost,
          port: parseInt(smtpPort, 10) || 587,
          user: smtpUser,
          password: smtpPassword,
          from: smtpFrom,
          secure: smtpSecure,
        },
      }).unwrap()

      toast.success('Store & Email settings saved successfully!')
    } catch {
      toast.error('Could not save settings')
    }
  }

  const handleSendTestEmail = async () => {
    if (!testEmailAddress) {
      toast.error('Please enter a recipient email')
      return
    }
    try {
      const res = await sendTestEmail(testEmailAddress).unwrap()
      toast.success(res.message || 'Test email dispatched successfully!')
    } catch {
      toast.error('Failed to send test email. Check your SMTP configuration.')
    }
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header matching Mockup 5 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Store Settings
          </h1>
          <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-200 uppercase tracking-wider">
            Admin Panel
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative grid size-9 place-items-center rounded-full bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 shadow-sm"
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#1f7a55]" />
          </button>
          <a
            href="#home"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-sm hover:bg-stone-50 transition-colors"
          >
            <Globe size={14} className="text-stone-500" /> View Store
          </a>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f7a55] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#186847] transition-colors disabled:opacity-50"
          >
            <Save size={15} /> {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid matching Mockup 5 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (approx 7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* General Information Card */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Store size={18} className="text-[#1f7a55]" />
                <h2 className="text-sm font-bold text-stone-900">General Information</h2>
              </div>
              <p className="mt-1 text-xs text-stone-400">
                Manage your basic store identification and contact details.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                />
              </div>

              {/* Logo & Favicon Uploads — stored via backend /uploads, URLs in DB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Store Logo</label>
                  <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-6 text-center hover:bg-stone-50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingLogo}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const formData = new FormData()
                        formData.append('image', file)
                        try {
                          await uploadStoreLogo(formData).unwrap()
                          toast.success('Store logo uploaded')
                        } catch {
                          toast.error('Could not upload logo')
                        } finally {
                          e.target.value = ''
                        }
                      }}
                    />
                    {serverSettings?.storeLogo ? (
                      <img src={serverSettings.storeLogo} alt="Store logo" className="mb-2 h-12 object-contain" />
                    ) : (
                      <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 mb-2">
                        <ImageIcon size={18} />
                      </span>
                    )}
                    <p className="font-semibold text-stone-800 text-[11px]">
                      {isUploadingLogo ? 'Uploading...' : 'Click to upload or drag logo'}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">PNG, JPG up to 2MB</p>
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Favicon</label>
                  <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-6 text-center hover:bg-stone-50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingFavicon}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const formData = new FormData()
                        formData.append('image', file)
                        try {
                          await uploadFavicon(formData).unwrap()
                          toast.success('Favicon uploaded')
                        } catch {
                          toast.error('Could not upload favicon')
                        } finally {
                          e.target.value = ''
                        }
                      }}
                    />
                    {serverSettings?.favicon ? (
                      <img src={serverSettings.favicon} alt="Favicon" className="mb-2 size-8 object-contain" />
                    ) : (
                      <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 mb-2">
                        <Upload size={18} />
                      </span>
                    )}
                    <p className="font-semibold text-stone-800 text-[11px]">{isUploadingFavicon ? 'Uploading...' : 'Upload Icon'}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">32×32px recommended</p>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Store Address</label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                />
              </div>
            </div>
          </div>

          {/* Business Registration Card */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
              <Building size={18} className="text-[#1f7a55]" />
              <h2 className="text-sm font-bold text-stone-900">Business Registration</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  GST / Tax Identification Number
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Registration Details
                </label>
                <textarea
                  rows={2}
                  value={registrationDetails}
                  onChange={(e) => setRegistrationDetails(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Default Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                  >
                    <option value="USD ($) - US Dollar">USD ($) - US Dollar</option>
                    <option value="INR (₹) - Indian Rupee">INR (₹) - Indian Rupee</option>
                    <option value="EUR (€) - Euro">EUR (€) - Euro</option>
                    <option value="GBP (£) - British Pound">GBP (£) - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Time Zone</label>
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                  >
                    <option value="(GMT-08:00) Pacific Time (US & Canada)">
                      (GMT-08:00) Pacific Time (US & Canada)
                    </option>
                    <option value="(GMT+05:30) India Standard Time">
                      (GMT+05:30) India Standard Time
                    </option>
                    <option value="(GMT+00:00) UTC">
                      (GMT+00:00) UTC
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Logistics Card */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
              <Truck size={18} className="text-[#1f7a55]" />
              <h2 className="text-sm font-bold text-stone-900">Shipping & Logistics</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Standard Delivery Charge
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-400">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={standardDeliveryCharge}
                      onChange={(e) => setStandardDeliveryCharge(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-8 pr-3 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Free Delivery Threshold
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-400">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={freeDeliveryThreshold}
                      onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-8 pr-3 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Delivery Regions
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {regions.map((reg) => (
                    <span
                      key={reg}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-700"
                    >
                      {reg}
                      <button
                        type="button"
                        onClick={() => handleRemoveRegion(reg)}
                        className="text-stone-400 hover:text-rose-600"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}

                  {showAddRegion ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Region name"
                        value={newRegion}
                        onChange={(e) => setNewRegion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddRegion()
                          if (e.key === 'Escape') setShowAddRegion(false)
                        }}
                        className="rounded-lg border border-stone-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#1f7a55]"
                      />
                      <button
                        type="button"
                        onClick={handleAddRegion}
                        className="rounded-lg bg-[#1f7a55] px-2 py-1 text-xs font-bold text-white"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddRegion(true)}
                      className="inline-flex items-center gap-1 rounded-lg border border-dashed border-stone-300 px-2.5 py-1 text-xs font-semibold text-stone-600 hover:border-stone-400 hover:bg-stone-50"
                    >
                      <Plus size={12} /> Add Region
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Email & Mailbox Configuration (SMTP) - User Explicit Requirement */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-[#1f7a55]" />
                <div>
                  <h2 className="text-sm font-bold text-stone-900">
                    Email & Password Configuration (SMTP)
                  </h2>
                  <p className="text-[11px] text-stone-400">
                    Outgoing email settings for customer notifications, receipts & OTP verification.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                Connected
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">SMTP Host (Gmail)</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                  />
                  <p className="mt-1 text-[11px] text-stone-400">
                    Gmail only — use an App Password, set in the backend .env or here (stored in DB).
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">SMTP Port</label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    SMTP User / Gmail address
                  </label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="e.g. bossco.store@gmail.com"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">SMTP Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-3.5 pr-10 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Sender / From Address
                </label>
                <input
                  type="text"
                  value={smtpFrom}
                  onChange={(e) => setSmtpFrom(e.target.value)}
                  placeholder="Bossco Naturals <no-reply@bossco.local>"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-stone-100">
                <div>
                  <p className="font-semibold text-stone-800">Secure Connection (SSL / TLS)</p>
                  <p className="text-[11px] text-stone-400">
                    Use port 465 for SSL or 587 with STARTTLS
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmtpSecure(!smtpSecure)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    smtpSecure ? 'bg-[#1f7a55]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      smtpSecure ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Test Email Section */}
              <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-4 space-y-2">
                <p className="font-bold text-stone-800">Send Test Email</p>
                <p className="text-[11px] text-stone-500">
                  Verify that your SMTP configuration can successfully deliver emails.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="Recipient email address"
                    className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={isTesting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#24412a] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#182b1d] transition-colors disabled:opacity-50"
                  >
                    <Send size={13} /> {isTesting ? 'Sending...' : 'Send Test'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (approx 5 cols) matching Mockup 5 */}
        <div className="space-y-6 lg:col-span-5">
          {/* Tax Configuration Card */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
              <Tag size={18} className="text-[#1f7a55]" />
              <h2 className="text-sm font-bold text-stone-900">Tax Configuration</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-stone-800">Enable GST/VAT</p>
                  <p className="text-[11px] text-stone-400">Calculate tax at checkout</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableTax(!enableTax)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    enableTax ? 'bg-[#1f7a55]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      enableTax ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={defaultTaxRate}
                  onChange={(e) => setDefaultTaxRate(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-2">Product Price Type</label>
                <div className="space-y-2">
                  <label
                    onClick={() => setProductPriceType('inclusive')}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                      productPriceType === 'inclusive'
                        ? 'border-[#1f7a55] bg-emerald-50/20 ring-1 ring-[#1f7a55]'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priceType"
                      checked={productPriceType === 'inclusive'}
                      onChange={() => setProductPriceType('inclusive')}
                      className="mt-0.5 text-[#1f7a55] focus:ring-[#1f7a55]"
                    />
                    <div>
                      <p className="font-bold text-stone-900">Tax Inclusive</p>
                      <p className="text-[11px] text-stone-400">Prices already include taxes</p>
                    </div>
                  </label>

                  <label
                    onClick={() => setProductPriceType('exclusive')}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                      productPriceType === 'exclusive'
                        ? 'border-[#1f7a55] bg-emerald-50/20 ring-1 ring-[#1f7a55]'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priceType"
                      checked={productPriceType === 'exclusive'}
                      onChange={() => setProductPriceType('exclusive')}
                      className="mt-0.5 text-[#1f7a55] focus:ring-[#1f7a55]"
                    />
                    <div>
                      <p className="font-bold text-stone-900">Tax Exclusive</p>
                      <p className="text-[11px] text-stone-400">Add taxes on top of price</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Order Settings Card */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
              <Store size={18} className="text-[#1f7a55]" />
              <h2 className="text-sm font-bold text-stone-900">Order Settings</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">MIN ORDER VAL</label>
                  <input
                    type="number"
                    value={minOrderVal}
                    onChange={(e) => setMinOrderVal(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">MAX ORDER VAL</label>
                  <input
                    type="number"
                    value={maxOrderVal}
                    onChange={(e) => setMaxOrderVal(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-stone-800">Allow COD</p>
                  <p className="text-[11px] text-stone-400">Cash on delivery available</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowCod(!allowCod)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    allowCod ? 'bg-[#1f7a55]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      allowCod ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Cancellation Window
                </label>
                <input
                  type="text"
                  value={cancellationWindow}
                  onChange={(e) => setCancellationWindow(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
                />
              </div>
            </div>
          </div>

          {/* Payment Methods Card */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
              <CreditCard size={18} className="text-[#1f7a55]" />
              <h2 className="text-sm font-bold text-stone-900">Payment Methods</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-stone-100 p-3">
                <span className="font-semibold text-stone-800">UPI Payments</span>
                <button
                  type="button"
                  onClick={() => setUpiEnabled(!upiEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    upiEnabled ? 'bg-[#1f7a55]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      upiEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-stone-100 p-3">
                <span className="font-semibold text-stone-800">Debit / Credit Card</span>
                <button
                  type="button"
                  onClick={() => setCardEnabled(!cardEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    cardEnabled ? 'bg-[#1f7a55]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      cardEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-stone-100 p-3">
                <span className="font-semibold text-stone-800">Net Banking</span>
                <button
                  type="button"
                  onClick={() => setNetBankingEnabled(!netBankingEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    netBankingEnabled ? 'bg-[#1f7a55]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      netBankingEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-stone-100 p-3">
                <span className="font-semibold text-stone-800">COD</span>
                <button
                  type="button"
                  onClick={() => setCodEnabled(!codEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    codEnabled ? 'bg-[#1f7a55]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      codEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
