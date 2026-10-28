import Link from "next/link";
import { cleanTitle, formatDate, postImage, type Page } from "@/lib/content";
import { asset } from "@/lib/asset";

export function PostCard({ post, large = false }: { post: Page; large?: boolean }) {
  const img = postImage(post);
  return (
    <article className="group relative">
      <Link href={post.path} className="block">
        <div className={`overflow-hidden rounded-2xl border frost-line bg-vapor ${large ? "aspect-[16/10]" : "aspect-[16/10]"}`}>
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset(img)} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 ease-out-ice group-hover:scale-[1.04]" />
          )}
        </div>
        <p className="mt-4 text-sm text-glacier">
          <time dateTime={post.date || undefined}>{formatDate(post.date)}</time>
          {post.categories[0] && <span className="ml-3 rounded-full border frost-line px-2 py-0.5 text-xs text-glacier/90">{post.categories[0]}</span>}
        </p>
        <h3 className={`heading mt-2 text-frost transition-colors group-hover:text-ember-2 ${large ? "text-2xl sm:text-[1.9rem]" : "text-xl"}`}>
          {cleanTitle(post.title)}
        </h3>
        {large && post.description && <p className="mt-3 line-clamp-3 max-w-[60ch] text-glacier-2">{post.description}</p>}
      </Link>
    </article>
  );
}
