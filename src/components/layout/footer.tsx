export default function Footer() {
    return (
      <footer className="bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-700">
            <p>&copy; {new Date().getFullYear()} Ohrid Guide. All rights reserved.</p>
          </div>
        </div>
      </footer>
    )
  }