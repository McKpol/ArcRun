import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Image } from '@unpic/qwik';


export default component$(() => {
  return (
    <>
      <div class='w-full h-full bg-gray-200 absolute rounded-[20px] text-gray border-2 border-gray-400'>
        <div class='flex w-full h-full'>
          <div class='ml-2 h-[98%] w-20 '>
            <Image width={47} height={47} class="opacity-100 top-1/2 -translate-y-1/2 relative left-1/2 -translate-x-1/2" src="/logosearch.png" />
          </div>
          <div class='w-full'>
            <input placeholder="Search with ArcRun" class='font-roboto text-[40px] bg-transparent text-black px-2 h-full border-transparent w-[100%] relative top-1/2 -translate-y-1/2 focus:outline-none' />
          </div>
            <div class='bg-gradient-to-r from-transparent via-gray-200/70 to-gray-200 absolute w-12 h-full right-0 mr-5' />
            <div class='w-4' />
          </div>
      </div>
    </>
  );
});

  export const head: DocumentHead = {
  title: "arcrun",
  meta: [
    {
      name: "arcrun",
      content: "arcrun",
    },
  ],
};
