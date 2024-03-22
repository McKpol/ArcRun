import { component$, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Image } from '@unpic/qwik';
import { appWindow, LogicalPosition, LogicalSize } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api";
import { register, unregisterAll } from '@tauri-apps/api/globalShortcut';
import * as tauriEvent from '@tauri-apps/api/event';

export default component$(() => {
  useVisibleTask$(async () => {
  
    await unregisterAll();

  // Change Size
  await appWindow.setSize(new LogicalSize(825, 90));
  
  // Change Position
  const x = window.screen.width / 2 - window.innerWidth / 2;
  let y = window.screen.height / 3.8 - window.innerHeight /2;
  await appWindow.setPosition(new LogicalPosition(x, y));

  // Data
  const result = document.getElementById("result")!;
  const inputElement = document.getElementById("input");
  const programDiv = document.getElementById("programMain")!;
  const dirDiv = document.getElementById("dirMain")!;
  const clone_list: HTMLElement[] = [];
  const all = document.getElementById("all")!;
  let lenghtList = 0;
  let programList = 0;
  let dirList = 0;
  let heightApp = 0;
// Search results
  const searchType: string[] = [];
  const searchNumber: string[] = [];
  const searchName: string[] = [];

  async function Showapp() {
    // Checking if window is not focused
    if (!(await appWindow.isFocused ())){
      all.style.visibility = "visible";
      console.log('Showing window');

      // Setting the value of input
      document.getElementsByTagName("input")[0].value = ""; 

      // Researching programs and files
      inputElement?.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: false
      }));

      // Show
      await appWindow.setFocus();
      await inputElement?.focus();
      await appWindow.show();
    }
  }

  await tauriEvent.listen<string>('show', async () => {
    await Showapp();
  });

  // Shortcut Alt + Space
  await register('Alt+Space', async () => {
    await Showapp();
  }); 

  // Hide when unfocused (set focus have purpuse when clicking alt + space)
  async function Hideapp() {
        await appWindow.setFocus();
        await inputElement?.focus();
        await appWindow.hide();
  }

  document.addEventListener('keydown', async (event) => {
    if (event.key == 'Escape') {
      await Hideapp();
  }}); 

  await appWindow.onFocusChanged(async () => {
    if (!(await appWindow.isFocused ())){
      await Hideapp();
    }
  })

  // Hide app when opening
  await appWindow.hide();
  
  // When typing do...
  inputElement?.addEventListener("input", async function() {
  
  programList = 0;
  dirList = 0;

  // Searching
    const message: string[] = await invoke("search", {
    search: document.getElementsByTagName("input")[0].value.toLowerCase(),
  
  }); 

  // Delete all 'cloneDiv'
      for (let i = 0; clone_list.length > i; i++){
        clone_list[i].remove();
      }

  // Separation of 'searchNumber', 'searchType' and 'programName'
    searchName.length = 0;
    searchNumber.length = 0;
    searchType.length = 0;

      for (let i = 0; i < message.length; i += 3) {
        searchNumber.push(message[i]);
        searchName.push(message[i + 1]);
        searchType.push(message[i + 2]);
    }

  // Show or Hide if search content is true
    if (message.length == 0){
      result.style.display = "none";
      await appWindow.setSize(new LogicalSize(825, 92));
      y = window.screen.height / 5;
    } else {

      if (searchName.length == 8){
        lenghtList = 8;
      } else {
        lenghtList = searchName.length;
      }

      for (let i = 0; i < lenghtList; i++) {
        if (searchType[i] == "0"){
          programList++;
        } else {
          dirList++;
        }
      }

      heightApp = 104 + 79 * programList + 54 * dirList - 4;
      
      result.style.display = "block";
      await appWindow.setSize(new LogicalSize(825, heightApp));
      y = window.screen.height / 5; 
      
  // Reversing list
    searchNumber.reverse();
    searchName.reverse();
    searchType.reverse();


  // Cloning and filling 'searchName' the 'programDiv' and 'dirDiv'
      for (let i = 0; message.length / 2 > i; i++){
        const name: any = searchName[i];
        
        if (name !== undefined){
        // 'programDiv'
          if (searchType[i] == "0"){
            const clonepro = programDiv.cloneNode(true) as HTMLElement;
            clonepro.id = i.toString();
            clonepro.children[1].children[0].textContent = name.toString();
            clonepro.style.display = "flex";
            clone_list.push(clonepro);
            programDiv.parentNode!.insertBefore(clonepro, programDiv.nextSibling);
          }
          if (searchType[i] == "1"){
            // 'dirDiv'
            const clonedir = dirDiv.cloneNode(true) as HTMLElement;
            clonedir.id = i.toString();
            clonedir.children[1].children[0].textContent = name.toString();
            clonedir.style.display = "flex";
            clone_list.push(clonedir);
            dirDiv.parentNode!.insertBefore(clonedir, dirDiv.nextSibling);
          }
        }
      }
    }

    for (let i = 0; i <= 11; i++) {
      document.getElementById(i.toString())?.addEventListener('click', function() {
        console.log(searchNumber[i]);

        invoke("open", {
          number: searchNumber[i],
          whattype: searchType[i]
        }); 

      });
    }
    
    // Change position    
    await appWindow.setPosition(new LogicalPosition(x, y));
  });
});

  return (
    <>
    <div id="all" class='invisible'>
      <div id='check' class='invisible text-[0px]' />
        <div class='bg-gray-200 relative rounded-[20px] text-gray border-2 border-gray-300 h-[90px] w-[800px] left-1/2 -translate-x-1/2'> 
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
        
        <div id='result' class='hidden bg-white/0 mt-3 h-5/6 w-full relative bottom-0 roundedd-[20px]'>
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
          <div id='dirMain' class='hidden mb-1 relative shadow-lg left-1/2 -translate-x-1/2 hover:w-full transition-all duration-200 cursor-pointer rounded-[10px] w-[795px] h-[50px] bg-gray-200 overflow-hidden 
          before:duration-100 before:left-1/2 before:-translate-x-1/2 before:bg-[#2f82f7]/0 before:hover:bg-[#2f82f7] before:w-[96%] before:rounded-[9px] before:hover:w-full before:h-full before:delay-75 before:transition-all before:absolute'>
            <div class='h-[98%] w-14'>
              <Image width={30} height={30} class="ml-1 relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" src="/folder.png" />
            </div>
            <div class='w-[93%]'>
              <div class='relative top-1/2 -translate-y-1/2 px-2 pt-[1px] font-roboto font-normal text-[24px] truncate'></div>
            </div>

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
