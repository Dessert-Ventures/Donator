import React, { useState } from "react"
import "./App.css"
import logo from "./logo.svg"

function App() {
  // TODO: Prefill amount from URL param
  const [amount, amountSetter] = useState<string>("10")

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
      </header>
    </div>
  )
}

export default App
