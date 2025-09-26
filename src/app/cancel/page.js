export default function CancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-3xl font-bold text-red-600">Payment Canceled ❌</h1>
      <p className="mt-4 text-lg">Looks like you canceled the payment. You can try again anytime.</p>
      <a
        href="/"
        className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
      >
        Return to Home
      </a>
    </div>
  );
}
