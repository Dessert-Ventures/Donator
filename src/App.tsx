import CryptoJS from "crypto-js"
import React, { useState } from "react"
import { v4 as uuid } from "uuid"
import "./App.css"
import mlynoteka from "./mlynoteka.svg"
// TODO: i18n for PL-pl

function App() {
  //Zamienic logo "MLYNOTEKA" na "TEATR MLYN"
  // TODO: Prefill amount from URL param
  const [email, emailSetter] = useState<string>("")
  const [amount, amountSetter] = useState<string>("10")
  const [postError, postErrorSetter] = useState<string | undefined>()

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newEmail: string = event.target.value
    emailSetter(newEmail)
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newAmount: string = event.target.value
    amountSetter(newAmount)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    let amountAsPaynowNumber = parseInt(amount) * 100 // in Polish grosz
    if (isNaN(amountAsPaynowNumber)) {
      return
    }

    console.log(
      `Submitting donation request with amount ${amountAsPaynowNumber}`
    )
    sendPostRequest(amountAsPaynowNumber, email)
  }

  const sendPostRequest = (amount: number, buyerEmail: string) => {
    const apiUrl =
      "https://cors-anywhere.herokuapp.com/https://api.sandbox.paynow.pl/v1/payments"
    const apiKey = "97a55694-5478-43b5-b406-fb49ebfdd2b5"
    const apiSignatureKey = "b305b996-bca5-4404-a0b7-2ccea3d2b64b"

    const description = "Darowizna"

    const requestBody = JSON.stringify({
      amount: amount,
      description: description,
      externalId: uuid(),
      buyer: { email: buyerEmail },
      continueUrl: "/",
    })
    const signature = CryptoJS.enc.Base64.stringify(
      CryptoJS.HmacSHA256(requestBody, apiSignatureKey)
    )
    const idempotencyKey = uuid()

    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
        Signature: signature,
        "Idempotency-Key": idempotencyKey,
      },
      body: requestBody,
    }

    fetch(apiUrl, requestOptions)
      .then((response) => response.json())
      .then(
        (data: { redirectUrl: string; paymentId: string; status: string }) => {
          const redirectUrl = data.redirectUrl
          console.log(redirectUrl)
          window.open(redirectUrl)
        }
      )
      .catch((e) => {
        postErrorSetter(JSON.stringify(e))
      })
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={mlynoteka} className="App-logo" alt="logo" />
        <hr className="hrTag" />
        <form onSubmit={handleSubmit} className="formCSS">
          <label>
            <p>Email</p>
            <input
              type="string"
              name="email"
              value={email}
              onChange={handleEmailChange}
            />
          </label>

          <label>
            <p>Donation Amount</p>
            <input
              type="number"
              name="amount"
              value={amount}
              onChange={handleAmountChange}
            />
          </label>
          <input type="submit" value="Donate" className="submitButton" />
        </form>

        {postError}
      </header>
    </div>
  )
}

export default App
