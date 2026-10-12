import { ContentPage } from '../components/ContentPage.jsx'

export default function VisitUs() {
  return (
    <ContentPage
      eyebrow="Visit Us"
      title="Come say hello — over teh tarik."
      body={
        <>
          <p>
            We host couples and vendors at our Johor Bahru office every Tuesday, Thursday,
            and Saturday between 10am and 6pm. Drop by for a planning consultation, vendor
            meet-and-greet, or just a tour of our boutique floor.
          </p>
          <p>
            <strong>Office:</strong> 60B, Jalan Tun Abdul Razak, 80100 Johor Bahru<br />
            <strong>WhatsApp:</strong> +60 12 345 6789
          </p>
        </>
      }
    />
  )
}
