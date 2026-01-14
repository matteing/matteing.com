---
title: "Using the Apple Music API from an Elixir app"
date: 2023-11-22T12:00:00
url: https://matteing.com/posts/using-the-apple-music-api-from-elixir-app
slug: using-the-apple-music-api-from-elixir-app
---

# Using the Apple Music API from an Elixir app

You _must_ have an active Apple Developer subscription to use the Apple Music API.

Before hitting any code, you must generate relevant certificates and IDs. [Here's a good resource for how to do this.](https://developer.apple.com/documentation/applemusicapi/generating_developer_tokens) In summa, you'll need the following things:

1.  MusicKit identifier (labelled as Key ID in the Apple Developer page)
2.  MusicKit private key (\*.p8 file)
3.  Team ID

## Getting your developer token

Let's begin by generating the Developer Token needed for every request to their API.

Install the following dependencies to your project:

```elixir
defp deps do
	[
		{:joken, "~> 2.5"},
		{:req, "~> 0.4.0"},
	]
end
```

Next up, write a function that loads the certificate from a local file and signs the JWT claims required by Apple Music. In the following code, I assume the parent module has a variable `@key_identifier` with your MusicKit Key ID and `@team_identifier`.

```elixir
def generate_token() do
	# Get private key from filesystem
	key_text = File.read!(Path.join(__DIR__, "certs/AuthKey.p8"))
	# Parse the key using JOSE.
	{_, key_map} =
	  JOSE.JWK.from_pem(key_text)
	  |> JOSE.JWK.to_map()

	# Initialize signer, passing in our kid into its header
	signer = Joken.Signer.create("ES256", key_map, %{"kid" => @key_identifier})

	claims = %{
	  "iss" => @team_identifier,
	  "iat" => :erlang.system_time(:seconds),
	  # Set an expiration date (12 hours here)
	  "exp" => :erlang.system_time(:seconds) + 43200
	}

	{:ok, token, _claims} = Joken.encode_and_sign(claims, signer)
	token
end
```

You're done getting your token. This JWT can be passed in to any Apple Music API call using the `Authorization` header. This was the hardest part.

## Authorizing yourself

Next up, you'll need to authorize yourself using a stub index.html app. In my case, I'm not building something production ready yet, so I wasn't ready to build a whole authorization flow.

In any case, this should be sufficient to play around with the API for a bit.

Fill an empty HTML document with two things:

1.  A `<button>` that can be used for triggering authorization
2.  A `<script>` tag with the relevant handling code

First, load up the MusicKit script:

```html
<script
  src="https://js-cdn.music.apple.com/musickit/v3/musickit.js"
  data-web-components
  async
></script>
```

Set up the required meta tags with the configuration code:

```html
<meta name="apple-music-developer-token" content="DEVELOPER-TOKEN" />
<meta name="apple-music-app-name" content="My Cool Web App" />
<meta name="apple-music-app-build" content="1978.4.1" />
```

Finally, set up the boilerplate for kicking off authorization:

```html
<body>
  <button>Authorize</button>
  <script>
    document.addEventListener("musickitloaded", async function () {
      const music = MusicKit.getInstance();

      document
        .querySelector("button")
        .addEventListener("click", async function () {
          // Request authorization
          console.log(await music.authorize());
        });
    });
  </script>
</body>
```

Note how I added aa `console.log` statement that outputs the result of `await music.authorize()`. This is undocumented in Apple's website, but it will output the token you need to call the API in your backend.

Do with this token whatever you need to do! In our case, I want to play with the token locally, so I'll hardcode it (yikes!) to my Elixir app.

### Using the token

The rest is easy peasy now! You've got your token. Here's some sample code that uses Req to get your listening history.

```elixir
def get_listening_history() do
	Req.get!(
	  url: "https://api.music.apple.com/v1/me/recent/played/tracks",
	  headers: %{
	    "Authorization" => "Bearer #{make_jwt()}",
	    "Music-User-Token" => @generated_token
	  }
	)
end
```

Hope this helps! Thanks to Pedro Piñera for the [his blog post covering a similar topic](https://t.co/WbNiH1oFVU).
