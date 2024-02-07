import { component$, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Image } from '@unpic/qwik';
import { appWindow, LogicalPosition, LogicalSize } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api";

export default component$(() => {
  useVisibleTask$(async () => {
  await appWindow.setSize(new LogicalSize(825, 90));
  const result = document.getElementById("result")!;
  const x = window.screen.width / 2 - window.innerWidth / 2;
  const inputElement = document.getElementById("input");
  const programDiv = document.getElementById("programMain")!;
  const clone_list: HTMLElement[] = [];
  let y = window.screen.height / 3.8 - window.innerHeight /2;
  await appWindow.setPosition(new LogicalPosition(x, y));

    appWindow.setFocus();
    await appWindow.onFocusChanged(async () => {
      if (!(await appWindow.isFocused())){
        appWindow.close();
      }
  })

  inputElement?.addEventListener("input", async function() {
    await appWindow.setPosition(new LogicalPosition(x, y));
    const message: string[] = await invoke("search", {
    search: document.getElementsByTagName("input")[0].value.toLowerCase(),
  });
    console.log(message); 

    if (message.length == 0){
      result.style.display = "none";
      await appWindow.setSize(new LogicalSize(825, 90));
      y = window.screen.height / 3.8 /* 2 */ - window.innerHeight / 2;
    } else {
      result.style.display = "block";
      await appWindow.setSize(new LogicalSize(825, 600));
      y = window.screen.height / 2 /* 2 */ - window.innerHeight / 2;

      for (let i = 0; clone_list.length > i; i++){
        clone_list[i].remove();
      }

      const programNumber: string[] = [];
      const programName: string[] = [];
      
      for (let i = 0; i < message.length; i += 2) {
        programNumber.push(message[i]);
        programName.push(message[i + 1]);
    }
      programNumber.reverse();
      programName.reverse();

      for (let i = 0; message.length / 2 > i; i++){
        console.log(i);
        const clone = programDiv.cloneNode(true) as HTMLElement;
        clone.id = i.toString();
        clone.children[1].children[0].textContent = programName[i].toString();
        clone.style.display = "flex";
        
        clone_list.push(clone);

        programDiv.parentNode!.insertBefore(clone, programDiv.nextSibling);
      }
    }
  });
});

  return (
    <>
    <div id='check' class='invisible text-[0px]' />
      <div class='bg-gray-200 absolute rounded-[20px] text-gray border-2 border-gray-300 h-[90px] w-[800px] left-1/2 -translate-x-1/2'>
        <div class='flex w-full h-full'>
          <div class='ml-2 h-[98%] w-20 '>
            <Image width={47} height={47} class="opacity-100 top-1/2 -translate-y-1/2 relative left-1/2 -translate-x-1/2" src="/logosearch.png" />
          </div>
          <div class='w-full'>
            <input id="input" placeholder="Search with ArcRun" class='font-roboto text-[40px] bg-transparent text-black px-2 h-full border-transparent w-[100%] relative top-1/2 -translate-y-1/2 focus:outline-none' />
          </div>
            <div class='bg-gradient-to-r from-transparent via-gray-200/70 to-gray-200 absolute w-12 h-full right-0 mr-5' />
            <div class='w-4' />
          </div>
      </div>
      
      <div id='result' class='hidden bg-white/0 h-5/6 w-full absolute bottom-0 roundedd-[20px]'>
      {/* div jako program */}
      <div id='programMain' class='hidden mb-1 relative shadow-lg left-1/2 -translate-x-1/2 hover:w-full transition-all duration-200 cursor-pointer rounded-[10px] w-[795px] h-[75px] bg-gray-200 overflow-hidden 
        before:duration-100 before:left-1/2 before:-translate-x-1/2 before:bg-[#2f82f7]/0 before:hover:bg-[#2f82f7] before:w-[96%] before:rounded-[9px] before:hover:w-full before:h-full before:delay-75 before:transition-all before:absolute'>
          <div class='h-[98%] w-14'>
            <Image width={38} height={38} class="ml-1 relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" src="/program.png" />
          </div>
          <div class='w-[93%]'>
            <div id='program' class='relative top-1/2 -translate-y-1/2 px-2 pt-[0px] font-roboto font-normal text-[28px] truncate'></div>
          </div>

        </div>
        
        {/* div jako folder */}
        <div class='relative shadow-lg left-1/2 -translate-x-1/2 hover:w-full transition-all duration-200 cursor-pointer rounded-[10px] w-[795px] h-[50px] bg-gray-200 flex overflow-hidden 
        before:duration-100 before:left-1/2 before:-translate-x-1/2 before:bg-[#2f82f7]/0 before:hover:bg-[#2f82f7] before:w-[96%] before:rounded-[9px] before:hover:w-full before:h-full before:delay-75 before:transition-all before:absolute'>
          <div class='h-[98%] w-14'>
            <Image width={30} height={30} class="ml-1 relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" src="/folder.png" />
          </div>
          <div class='w-[93%]'>
            <div class='relative top-1/2 -translate-y-1/2 px-2 pt-[1px] font-roboto font-normal text-[24px] truncate'>PlaceHolder</div>
          </div>

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
