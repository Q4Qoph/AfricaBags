'use client';

export default function AboutPage() {
  return (
    <div className="bg-[#FAF6F1] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-[#2C1810] mb-8 text-center">
          About AfricaBags
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <img
              src="https://images.pexels.com/photos/8927720/pexels-photo-8927720.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Craftsmanship"
              className="rounded-xl shadow-lg w-full"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-[#2C1810] mb-4">
              Our Story
            </h2>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              AfricaBags was founded with a mission to showcase the incredible talent and craftsmanship of East African artisans. Each bag we offer is carefully handcrafted using traditional techniques passed down through generations.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We work directly with local communities to ensure fair wages, sustainable practices, and the preservation of traditional crafts. When you purchase from us, you're not just buying a bag – you're supporting artisans and their families.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <h3 className="text-2xl font-bold text-[#C1502E] mb-4">Handcrafted</h3>
            <p className="text-gray-700">
              Every bag is made by hand with attention to detail and quality craftsmanship.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <h3 className="text-2xl font-bold text-[#C1502E] mb-4">Sustainable</h3>
            <p className="text-gray-700">
              We use eco-friendly materials and sustainable production methods.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <h3 className="text-2xl font-bold text-[#C1502E] mb-4">Fair Trade</h3>
            <p className="text-gray-700">
              Our artisans receive fair compensation for their exceptional work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
