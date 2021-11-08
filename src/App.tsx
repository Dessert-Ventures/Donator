import { ThemeProvider } from "@emotion/react"
import FacebookIcon from "@mui/icons-material/Facebook"
import InstagramIcon from "@mui/icons-material/Instagram"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import { createTheme } from "@mui/material/styles"
import TextField from "@mui/material/TextField"
import CryptoJS from "crypto-js"
import React, { useEffect, useState } from "react"
import ReactGA from "react-ga"
import { Trans, useTranslation } from "react-i18next"
import { v4 as uuid } from "uuid"
import "./App.css"
import dzienDobryWarszawo from "./assets/dzienDobryWarszawo.png"
import scek2 from "./assets/scek2.jpg"
import TeatrMlynLogo from "./assets/TeatrMlynLogo.png"
import zakochajSiewWarszawie from "./assets/zakochajSiewWarszawie.jpg"
import { validateAmount, validateEmail } from "./common/Helpers"
import MyPopover from "./components/MyPopover"

const theme = createTheme({
  palette: {
    neutral: {
      main: "#000000",
      contrastText: "#FFFFFF",
    },
  },
})

declare module "@mui/material/styles" {
  interface Palette {
    neutral: Palette["primary"]
  }

  // allow configuration using `createTheme`
  interface PaletteOptions {
    neutral?: PaletteOptions["primary"]
  }
}

// Update the Button's color prop options
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    neutral: true
  }
}

const DEV_MODE = process.env.NODE_ENV === "development" || false
const APP_URL = DEV_MODE ? "http://localhost:3000" : "https://wesprzyj.mlyn.org"

const QUERY_PARAMS = new URLSearchParams(window.location.search)
const QUERY_PARAMS_PAYMENT_STATUS = QUERY_PARAMS.get("paymentStatus")
const QUERY_PARAMS_AMOUNT = QUERY_PARAMS.get("amount")

function App() {
  const [loading, loadingSetter] = useState(false)
  const [postErrors, postErrorsSetter] = useState<any[]>()
  const [paymentStatus] = useState<string | null>(QUERY_PARAMS_PAYMENT_STATUS)

  const [email, emailSetter] = useState<string>("")
  const [emailValid, emailValidSetter] = useState<boolean>()
  const [amount, amountSetter] = useState<string>(QUERY_PARAMS_AMOUNT ?? "")
  const [amountValid, amountValidSetter] = useState<boolean>()

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newEmail: string = event.target.value
    emailSetter(newEmail)
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newAmount: string = event.target.value
    amountValidSetter(validateAmount(newAmount))
    amountSetter(newAmount)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const emailIsValid = validateEmail(email)
    emailValidSetter(emailIsValid)
    const amountIsValid = validateAmount(amount)
    amountValidSetter(amountIsValid)

    if (!emailIsValid || !amountIsValid) {
      ReactGA.event({
        category: "User",
        action: "Pressed Donate",
        label: "Validation Failed",
        value: parseInt(amount),
      })
    } else {
      let amountAsPaynowNumber = parseInt(amount) * 100 // in Polish grosz

      ReactGA.event({
        category: "User",
        action: "Pressed Donate",
        label: "Validation Passed",
        value: parseInt(amount),
      })

      console.log(
        `Submitting donation request with amount ${amountAsPaynowNumber}`
      )
      sendPostRequest(amountAsPaynowNumber, email)
    }
  }

  const sendPostRequest = (amount: number, buyerEmail: string) => {
    loadingSetter(true)
    postErrorsSetter(undefined)

    const apiUrl =
      "https://cors-anywhere.herokuapp.com/https://api.sandbox.paynow.pl/v1/payments" // TODO: Self-host; https://cors-anywhere.herokuapp.com/corsdemo

    // TODO: Set to production keys
    const apiKey = "97a55694-5478-43b5-b406-fb49ebfdd2b5"
    const apiSignatureKey = "b305b996-bca5-4404-a0b7-2ccea3d2b64b"

    const description = "Darowizna"

    const requestBody = JSON.stringify({
      amount: amount,
      description: description,
      externalId: uuid(),
      buyer: { email: buyerEmail },
      continueUrl: APP_URL,
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
        (data: {
          redirectUrl: string
          paymentId: string
          status: string
          errors?: any[]
        }) => {
          if (data.errors) {
            console.warn(data)
            postErrorsSetter(data.errors)
          } else {
            console.debug(data)
            const redirectUrl = data.redirectUrl
            if (redirectUrl) {
              window.location.href = redirectUrl
            }
          }
        }
      )
      .catch((e) => {
        console.warn(e)
        postErrorsSetter([e])
      })
      .finally(() => {
        loadingSetter(false)
      })
  }

  useEffect(() => {
    setCurrentLanguage("pl")

    const TRACKING_ID = "UA-207896383-1"
    ReactGA.initialize(TRACKING_ID)

    DEV_MODE && console.debug("Donator running in dev mode")
  }, [])

  const [currentLanguage, setCurrentLanguage] = useState("pl")
  const { t, i18n } = useTranslation()
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "pl" ? "en" : "pl"
    i18n.changeLanguage(newLanguage)
    setCurrentLanguage(newLanguage)
  }

  return (
    <div className="App">
      <header className="App-header">
        <img
          src={TeatrMlynLogo}
          className="App-logo"
          alt="logo"
          style={{ cursor: "pointer" }}
          onClick={() => window.open("https://mlyn.org/")}
        />
        <hr className="hrTag" />
        <h4 className="upperText">
          <Trans i18nKey="title"></Trans>
        </h4>
        {loading ? t("Loading...") : null}
        {paymentStatus ? `Status: ${paymentStatus}` : null}
        {postErrors
          ? `Error, please try again. Technical details: ${JSON.stringify(
              postErrors
            )}`
          : null}

        <form onSubmit={handleSubmit} className="form">
          <label>
            <div
              className="testEmail"
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <span style={{ paddingRight: ".3em" }}>Email</span>
              <MyPopover
                text={
                  currentLanguage === "pl"
                    ? "Email zostanie wykorzystany wyłącznie w celu przeprowadzenia płatności"
                    : "The email will only be used to process the payment"
                }
              />
            </div>
            {
              <section>
                {" "}
                <Box
                  component="span"
                  sx={{
                    "& > :not(style)": { m: 1, width: "20ch" },
                  }}
                >
                  <TextField
                    size="small"
                    id="email:"
                    name="email"
                    variant="outlined"
                    value={email}
                    onChange={handleEmailChange}
                    helperText={emailValid === false ? t("invalidInput") : ""}
                    error={emailValid === false ? true : undefined}
                  />
                </Box>
              </section>
            }
          </label>

          <label>
            <p>
              {" "}
              <Trans i18nKey="DA"></Trans>
            </p>

            {
              <section>
                {" "}
                <Box
                  component="span"
                  sx={{
                    "& > :not(style)": { m: 1, width: "20ch" },
                  }}
                >
                  <TextField
                    size="small"
                    type="number"
                    id="number:"
                    name="number"
                    variant="outlined"
                    value={amount}
                    onChange={handleAmountChange}
                    helperText={amountValid === false ? t("invalidInput") : ""}
                    error={amountValid === false ? true : undefined}
                  />
                </Box>
              </section>
            }
          </label>
          <ThemeProvider theme={theme}>
            <Button
              type="submit"
              variant="contained"
              size="medium"
              className="submitMUIbutton"
              color="neutral"
            >
              <Trans i18nKey="Button">PRZEŚLIJ </Trans>
            </Button>
          </ThemeProvider>
        </form>
        <hr className="hrTag" />
        <button onClick={toggleLanguage}>
          {currentLanguage === "pl" ? "English" : "Polski"}
        </button>
        <footer className="footer">
          <div>
            <h4>TEATR MŁYN</h4>
            <h6>
              {" "}
              <Trans i18nKey="footer.description1.1">
                Stołeczne Centrum Edukacji Kulturalnej
              </Trans>
            </h6>
            <h6>
              {" "}
              <Trans i18nKey="footer.description1.2">
                Scena Na Poddaszu III p.
              </Trans>
            </h6>
            <h6>
              <Trans i18nKey="footer.description1.3">
                ul. Jezuicka 4 Warszawa
              </Trans>
            </h6>
          </div>
          <div>
            <h4>
              {" "}
              <Trans i18nKey="footer.Title2">KONTAKT</Trans>
            </h4>
            <h6>fundacjamlyn@gmail.com</h6>
            <h6>promocja@fundacjamlyn.pl</h6>
            <h6>rezerwacje@fundacjamlyn.pl</h6>
            <h6>519 672 356</h6>
            {/* <hr className="hrTag" /> */}
          </div>
          <div>
            <h4>
              {" "}
              <Trans i18nKey="footer.Title3">ZNAJDZIESZ NAS:</Trans>
            </h4>
            <section className="testt">
              <InstagramIcon
                fontSize="large"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  window.open("https://www.instagram.com/teatrmlyn/")
                }
              />
            </section>
            <section className="testt">
              <FacebookIcon
                fontSize="large"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  window.open(
                    "https://www.facebook.com/fundacja.artystyczna.mlyn"
                  )
                }
              />
            </section>

            {/* <hr className="hrTag" /> */}
            {/* <p>Partnerzy teatru:</p> */}
          </div>

          {/* {<h4 className="upperText">O NAS: DANE KONTAKTOWE</h4>}  */}
        </footer>

        <footer className="Lowerfooter">
          <div>
            <h4>
              {" "}
              <Trans i18nKey="footer.Title4">Współfinansuje: </Trans>
            </h4>
            <img
              src={zakochajSiewWarszawie}
              className="partner-logo1"
              alt="logo"
              style={{ cursor: "pointer" }}
              onClick={() => window.open("https://um.warszawa.pl/")}
            />
          </div>

          <div>
            <h4>
              {" "}
              <Trans i18nKey="footer.Title5">Partnerzy teatru: </Trans>
            </h4>
            <img
              src={scek2}
              className="partner-logo"
              alt="logo"
              style={{ cursor: "pointer" }}
              onClick={() => window.open("https://scek.pl/")}
            />
            <img
              src={dzienDobryWarszawo}
              className="partner-logo"
              alt="logo"
              style={{ cursor: "pointer" }}
              onClick={() => window.open("https://www.dziendobrywarszawo.pl/")}
            />
          </div>
        </footer>
      </header>
    </div>
  )
}

export default App
