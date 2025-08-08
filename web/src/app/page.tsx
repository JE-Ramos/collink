import Image from "next/image";

export default function Home() {
  return (
    <main>
      <Image
        src="https://www.beercss.com/beer-and-woman.svg"
        className="responsive round medium-height"
        alt="BeerCSS illustration"
        width={800}
        height={400}
      />
      <h3>Welcome</h3>
      <h5>The beer is ready!</h5>
      <div className="space"></div>
      <a className="button" href="/links">
        <i>link</i>
        <span>Go to Links</span>
      </a>
    </main>
  );
}
