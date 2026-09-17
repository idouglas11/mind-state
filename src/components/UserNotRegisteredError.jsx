export default function UserNotRegisteredError() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-3xl font-light text-gray-800 mb-2">Access restricted</h1>
        <p className="text-gray-500">This account isn't registered for this app.</p>
      </div>
    </div>
  );
}
