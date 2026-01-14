---
title: "Keep your Erlang ETS tables around"
date: 2023-12-15T12:00:00
url: https://matteing.com/posts/til-keeping-an-erlang-ets-table-running-indefinitely
slug: til-keeping-an-erlang-ets-table-running-indefinitely
---

# Keep your Erlang ETS tables around

Quick TIL here.

I've been using ETS as a small key-value cache for a project I'm working on. This is the setup: an Oban periodic job would set a `:last_response` key, which would be checked the next time the job ran. The first time would simply fetch the response from the remote API and set the intial key. Simple, right?

I was using ETS for this, and the tables didn't seem to stick around. I couldn't for the life of me figure out why. To keep it short, turns out that ETS tables are attached to the Erlang process that creates them. If that process dies, the table is wiped out. It's not an interpreter-global database as I thought initially.

The solution is simple: just create a dedicated GenServer to wrap the table. This keeps it alive (and provides a nicer interface for it, too!).

```elixir
defmodule Athena.IngestWorkerCache do
  use GenServer

  @table_name :am_ingest_cache

  def init(arg) do
    :ets.new(@table_name, [
      :set,
      :public,
      :named_table,
      {:read_concurrency, true},
      {:write_concurrency, true}
    ])

    {:ok, arg}
  end

  def start_link(arg) do
    GenServer.start_link(__MODULE__, arg, name: __MODULE__)
  end

  def get(key) do
    case :ets.lookup(@table_name, key) do
      [] ->
        nil

      [{_key, value}] ->
        value
    end
  end

  def put(key, value) do
    :ets.insert(@table_name, {key, value})
  end
end
```

This will keep the ETS table running. Add the GenServer to your supervision tree and that's about it. It's super handy for those times where you need a key-value store, but managing a Redis instance or some other BS is... ugh!

Note that it still isn't a database, but an ephemeral store. Perfect for this use case, but that's about it!

Here's a couple links that saved my ass:

- [Elixir School: ETS](https://elixirschool.com/en/lessons/storage/ets)
- [ETS created on Application init](https://elixirforum.com/t/ets-created-on-application-init/21608/2)
- [Don't lose your ETS tables](http://steve.vinoski.net/blog/2011/03/23/dont-lose-your-ets-tables/)
