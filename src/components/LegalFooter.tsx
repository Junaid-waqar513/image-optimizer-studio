import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function LegalContent() {
  return (
    <div className="space-y-6 leading-relaxed text-sm text-muted-foreground">
      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">1. TERMS OF SERVICE</h3>
        <p>
          Welcome to ExpatMail AI ("we", "our", "us"). By using our website (https://lovable.app),
          you agree to these terms. Our application leverages artificial intelligence utility models
          (via Google Gemini API) to read, translate, and extract structured checklist data from
          official user-uploaded government and bureaucratic documents. We provide informational
          analysis only. We are not a legal firm, legal counsel, or official translators. Users
          retain full responsibility for verifying all deadlines, figures, and payments against
          their physical mail labels.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">2. GDPR PRIVACY POLICY</h3>
        <p>
          We take data privacy exceptionally seriously, especially under European Union General Data
          Protection Regulation (GDPR) frameworks.
        </p>
        <ul className="mt-3 list-disc space-y-3 pl-5">
          <li>
            <span className="font-medium text-foreground">Data Collection:</span> We process image
            files uploaded directly by you. These images are transmitted securely server-to-server
            to the Google Gemini API solely for extraction and translation processing.
          </li>
          <li>
            <span className="font-medium text-foreground">Data Retention:</span> We do not
            permanently store or archive your uploaded document files or images on our servers. The
            image is processed in real-time volatile memory and discarded instantly once the Webhook
            Response sends the translated text back to your screen.
          </li>
          <li>
            <span className="font-medium text-foreground">Payment Data:</span> Payment handling is
            managed completely externally by our Merchant of Record, Paddle.com. We never see, log,
            or store your credit card or financial account parameters.
          </li>
          <li>
            <span className="font-medium text-foreground">Your Rights:</span> You have the right to
            request deletion of your account metadata at any time by contacting our support panel.
          </li>
        </ul>
      </div>
    </div>
  );
}

export function LegalFooterLink({ className = "" }: { className?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4 ${className}`}
        >
          Privacy Policy &amp; Terms
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>LEGAL POLICY: EXPATMAIL AI</DialogTitle>
          <DialogDescription className="sr-only">
            Terms of Service and GDPR Privacy Policy for ExpatMail AI
          </DialogDescription>
        </DialogHeader>
        <LegalContent />
      </DialogContent>
    </Dialog>
  );
}
