import { Gift } from 'lucide-react'
import { ContentPage } from '../components/ContentPage.jsx'

export default function Referral() {
  return (
    <ContentPage
      eyebrow="Referral"
      title="Share the love — earn together."
      body={
        <>
          <p>
            Refer a friend to Golden Promise and you'll both unlock RM 100 in vendor
            credits the moment they book their first vendor.
          </p>
          <p>
            How it works: log in to your dashboard, copy your unique referral link, and
            send it to a soon-to-be-engaged friend. We'll handle the rest.
          </p>
        </>
      }
    >
      <div className="mt-10 inline-flex items-center gap-3 px-5 py-3 rounded-full bg-burgundy-900 text-blush-100">
        <Gift className="w-5 h-5" />
        Available once you're logged in.
      </div>
    </ContentPage>
  )
}
