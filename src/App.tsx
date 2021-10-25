import React, { useState } from "react"
import { v4 as uuid } from "uuid"
import "./App.css"
import logo from "./logo.svg"

function App() {
  // TODO: Prefill amount from URL param
  const [amount, amountSetter] = useState<string>("10")
  const [email] = useState<string>("donator@dessertventures.com")
  const [postError, postErrorSetter] = useState<string | undefined>()

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newAmount: string = event.target.value
    amountSetter(newAmount)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    let amountAsNumber = parseInt(amount)
    if (isNaN(amountAsNumber)) {
      return
    }

    console.log(`Submitting donation request with amount ${amount}`)
    sendPostRequest(amountAsNumber, email)
  }

  const sendPostRequest = (amount: number, buyerEmail: string) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amount,
        description: "Donation",
        externalId: uuid(),
        buyer: { email: buyerEmail },
      }),
    }
    fetch("https://reqres.in/api/posts", requestOptions)
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((e) => {
        postErrorSetter(JSON.stringify(e))
      })
  }

  return (
    <div className="App">
      <header className="App-header">
        {/* TODO: Logo & branding */}
        <img src={logo} className="App-logo" alt="logo" />

        <form onSubmit={handleSubmit}>
          <label>
            <p>Donation Amount</p>
            <input
              type="number"
              name="amount"
              value={amount}
              onChange={handleAmountChange}
            />
          </label>
          <input type="submit" value="Donate" />
        </form>

        {postError}
      </header>
    </div>
  )
}

export default App
