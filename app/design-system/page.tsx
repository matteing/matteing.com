export default function DesignSystem() {
  return (
    <main className="container">
      <h1>Design System</h1>
      
      <section>
        <h2>Typography</h2>
        <p>
          Base text at 0.875rem (14px) with weight 315 and 1.5 line-height.
          This is how regular paragraph text appears throughout the site.
        </p>
        <p>
          <strong>Semibold text</strong> uses weight 535 for emphasis.
        </p>
      </section>

      <section>
        <h2>Headings</h2>
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>
        <h6>Heading 6</h6>
        <p>All headings share the same size as body text, differentiated only by weight.</p>
      </section>

      <section>
        <h2>Prose</h2>
        <article className="prose">
          <p>
            This is an example of long-form prose content. The text should be comfortable 
            to read with appropriate line-height and measure. Good typography makes reading 
            effortless and keeps the reader engaged with the content.
          </p>
          <p>
            A second paragraph demonstrates spacing between blocks of text. Notice how the 
            spacing creates rhythm and helps separate distinct thoughts. The column width 
            is constrained to approximately 40em for optimal readability.
          </p>
          <blockquote>
            "Design is not just what it looks like and feels like. Design is how it works."
            <cite>— Steve Jobs</cite>
          </blockquote>
          <p>
            Lists are also common in prose content:
          </p>
          <ul>
            <li>First item in an unordered list</li>
            <li>Second item with more detail</li>
            <li>Third item to complete the set</li>
          </ul>
          <ol>
            <li>First step in an ordered process</li>
            <li>Second step follows naturally</li>
            <li>Final step concludes the sequence</li>
          </ol>
          <p>
            Inline elements like <code>code snippets</code>, <em>emphasized text</em>, 
            and <strong>strong text</strong> should integrate seamlessly.
          </p>
        </article>
      </section>

      <section>
        <h2>Colors</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div className="bg-white" style={{ width: "4rem", height: "4rem", border: "1px solid var(--color-gray-3)" }} />
            <span>white</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div className="bg-gray-1" style={{ width: "4rem", height: "4rem" }} />
            <span>gray-1</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div className="bg-gray-2" style={{ width: "4rem", height: "4rem" }} />
            <span>gray-2</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div className="bg-gray-3" style={{ width: "4rem", height: "4rem" }} />
            <span>gray-3</span>
          </div>
        </div>
      </section>

      <section>
        <h2>Text Colors</h2>
        <p className="text-text-primary">Primary text color (text-primary)</p>
        <p className="text-text-secondary">Secondary text color (text-secondary)</p>
        <p className="text-gray-1">Gray 1 text</p>
        <p className="text-gray-2">Gray 2 text</p>
        <p className="text-gray-3">Gray 3 text</p>
      </section>

      <section>
        <h2>Links</h2>
        <p>
          Internal links appear as <a href="#">standard links with hover state</a>.
        </p>
        <p>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="link-outbound">
            Outbound links ↗
          </a>
          {" "}open in new tabs and have a visual indicator.
        </p>
      </section>

      <section>
        <h2>Buttons</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <button className="btn">Default Button</button>
          <button className="btn btn-primary">Primary Button</button>
          <button className="btn btn-ghost">Ghost Button</button>
          <button className="btn" disabled>Disabled Button</button>
        </div>
      </section>

      <section>
        <h2>Inputs</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem", maxWidth: "24rem" }}>
          <div>
            <label className="label">Text Input</label>
            <input type="text" className="input" placeholder="Enter text..." />
          </div>
          <div>
            <label className="label">Email Input</label>
            <input type="email" className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Disabled Input</label>
            <input type="text" className="input" placeholder="Cannot edit" disabled />
          </div>
          <div>
            <label className="label">Textarea</label>
            <textarea className="input" rows={3} placeholder="Write something..." />
          </div>
          <div>
            <label className="label">Select</label>
            <select className="input">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        <h2>Figures &amp; Images</h2>
        <figure className="figure">
          <img 
            src="https://picsum.photos/800/400" 
            alt="Sample landscape"
            style={{ width: "100%", height: "auto" }}
          />
          <figcaption>A sample image with caption describing the content.</figcaption>
        </figure>

        <figure className="figure full-bleed">
          <img 
            src="https://picsum.photos/1600/400" 
            alt="Full bleed landscape"
            style={{ width: "100%", height: "auto" }}
          />
          <figcaption style={{ maxWidth: "40em", margin: "0 auto", padding: "0 2em" }}>
            A full-bleed image that spans the entire viewport width.
          </figcaption>
        </figure>
      </section>

      <section>
        <h2>Cards</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))", gap: "1rem", marginTop: "1rem" }}>
          <article className="card">
            <h3>Basic Card</h3>
            <p>A simple card component with a title and some descriptive text content.</p>
          </article>
          
          <article className="card">
            <img 
              src="https://picsum.photos/400/200" 
              alt="Card image" 
              style={{ width: "100%", height: "auto", marginBottom: "1rem" }}
            />
            <h3>Card with Image</h3>
            <p>Cards can include images above the content area.</p>
          </article>

          <article className="card card-interactive">
            <h3>Interactive Card</h3>
            <p>This card has hover and focus states for clickable cards.</p>
          </article>
        </div>
      </section>

      <section>
        <h2>Spacing</h2>
        <p>Base spacing unit: 0.25rem (4px)</p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", marginTop: "1rem" }}>
          <div className="bg-gray-2 p-1" style={{ width: "fit-content" }}>p-1</div>
          <div className="bg-gray-2 p-2" style={{ width: "fit-content" }}>p-2</div>
          <div className="bg-gray-2 p-4" style={{ width: "fit-content" }}>p-4</div>
          <div className="bg-gray-2 p-8" style={{ width: "fit-content" }}>p-8</div>
        </div>
      </section>

      <section>
        <h2>Full Bleed</h2>
        <p>Content above is constrained to 40em max-width.</p>
      </section>

      <div className="full-bleed bg-gray-1" style={{ padding: "2rem", color: "var(--color-white)" }}>
        <p style={{ textAlign: "center" }}>This element breaks out to full viewport width using the <code>full-bleed</code> class.</p>
      </div>

      <section>
        <h2>Container</h2>
        <p>
          The container uses a CSS Grid layout with responsive padding.
          Content is centered with a max-width of 40em.
        </p>
      </section>
    </main>
  );
}
