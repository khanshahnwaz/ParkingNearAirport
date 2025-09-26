export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-3xl font-bold text-green-600">Payment Successful 🎉</h1>
      <p className="mt-4 text-lg">Thank you for your purchase. Your booking is confirmed!</p>
      <a
        href="/"
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Go Back Home
      </a>
    </div>
  );
}
