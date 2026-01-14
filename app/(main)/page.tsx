import { Description } from "@/components/Description";
import { Timeline } from "@/components/Timeline";
import { workItems } from "@/data/experience";
import { getFeaturedPosts } from "@/lib/posts";
import { getNowPlayingState } from "@/lib/apple-music/now-playing";
import MusicPlayer from "@/components/MusicPlayer/MusicPlayer";
import { Section } from "@/components/Section";
import { FeaturedPosts } from "@/components/FeaturedPosts";
import { ViewMoreLink } from "@/components/ViewMoreLink";

export const metadata = {
  title: "Sergio Mattei",
};

export default async function Home() {
  const displayedWork = workItems.slice(0, 3);
  const featuredPosts = getFeaturedPosts(3);
  const nowPlaying = await getNowPlayingState();

  return (
    <>
      <Description>
        I&apos;m a 1&#215;-exit engineer passionate about building delightful
        user experiences.
      </Description>

      <Timeline title="Work Experience" items={displayedWork} />

      <div className="-mt-8 mb-12 md:ml-[9.5rem]">
        <ViewMoreLink href="/cv">View full CV</ViewMoreLink>
      </div>

      {featuredPosts.length > 0 && (
        <Section id="from-my-blog" title="From The Blog">
          <FeaturedPosts posts={featuredPosts} />
        </Section>
      )}

      {nowPlaying?.track && (
        <Section id="now-playing" title="Apple Music">
          <MusicPlayer initialData={nowPlaying} />
        </Section>
      )}
    </>
  );
}
