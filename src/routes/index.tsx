import { component$, useVisibleTask$, useOnDocument, $, useStore } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Image } from '@unpic/qwik';
import { appWindow, LogicalPosition, LogicalSize } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api";
import { register, unregisterAll } from '@tauri-apps/api/globalShortcut';
import * as tauriEvent from '@tauri-apps/api/event';
import { convertFileSrc } from "@tauri-apps/api/tauri";

interface Settings{
  scale: number;
  top: number;
  left: number;
  text: string;
  icon: string;
}

export default component$(() => {
  const settings = useStore<Settings>({
    scale: 100,
    top: 5,
    left: 5,
    text: "Search with ArcRun",
    icon: "/logo new.png"
  });

  useVisibleTask$(async () => {
  
    await unregisterAll(); 

  let message: string;

 async function Read(){
  // Read Scale
  message = await invoke("read_settings", {
    line: 0
  });
  settings.scale = Number(message) * 100 / 8 + 50;

  // Read top
  message = await invoke("read_settings", {
    line: 1
  });
  
  settings.top = Number(message) / 10;

  // Read left
  message = await invoke("read_settings", {
    line: 2
  });

  settings.left = Number(message) / 10;

  // Read text
  message = await invoke("read_settings", {
    line: 3
  });

  settings.text = message;

  const iconset = await invoke("read_settings", {
    line: 5
  });

  message = await invoke("read_settings", {
    line: 4
  });

  if (iconset == "custom"){
    settings.icon = convertFileSrc(message);
  }
  if (iconset == "deafult"){
    settings.icon = "/logo new.png";
  }

  
 }

 Read();
  
  // Change Size
  await appWindow.setSize(new LogicalSize(825 * settings.scale / 100, 90 * settings.scale / 100));

  // Change Position
  let x = window.screen.width / 2 - window.innerWidth / 2;
  let y = window.screen.height / 2 - window.innerHeight /2;
  await appWindow.setPosition(new LogicalPosition(x, y)); 

  // Data
  const result = document.getElementById("result")!;
  const inputElement = document.getElementById("input");
  const programDiv = document.getElementById("programMain")!;
  const dirDiv = document.getElementById("dirMain")!;
  const clone_list: HTMLElement[] = [];
  const all = document.getElementById("all")!;
  const username = await invoke("get_username");
  let otherAction = 0;
  let lenghtList = 0;
  let programList = 0;
  let dirList = 0;
  let heightApp = 0;
  let selected = -1;
  let alreadySearching = false;
  let block = false;
  let blockhide = false;
  

// Search results
  const searchType: string[] = [];
  const searchNumber: string[] = [];
  const searchName: string[] = [];

// document.addEventListener('keydown', function(event) {
//     if ([38, 40].includes(event.keyCode)) {
//         event.preventDefault();
//     }
// });

  function Changehover(numberofdiv: number, selected: number, nonanimation: boolean = false){
    let divElement;
    for (let i = 0; i < numberofdiv; i++){
      divElement = document.getElementById(i.toString())!;
      if (divElement.classList.contains("hovered-result") || divElement.classList.contains("non-animation")){
        divElement.classList.remove("hovered-result");
        divElement.classList.remove("non-animation");
        divElement.classList.add("unhovered-result");
      }
    }
    if (!(selected == -1)){
      divElement = document.getElementById(selected.toString())!;
      divElement.classList.remove("unhovered-result");
      if (nonanimation){
        divElement.classList.add("non-animation");
      } else {
        divElement.classList.add("hovered-result");
      }
      
  }
}


document.addEventListener('wheel', (event) => {
  if (Math.sign(event.deltaY) == -1){
    if (!(selected == -1)){
      if (selected + 1 < searchName.length){
        selected++;
        Changehover(searchName.length, selected);
      }
  }
  } else if (Math.sign(event.deltaY) == 1) {
    if (!(selected == -1)){
      if (selected - 1 > -1){
      selected--;
      Changehover(searchName.length, selected);
    }
  } else {
      selected = searchName.length - 1;
      Changehover(searchName.length, selected);
  }
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key == 'ArrowUp') {
    if (!(selected == -1)){
      if (selected + 1 < searchName.length){
        selected++;
        Changehover(searchName.length, selected);
      }
  }
}
  if (event.key == 'ArrowDown') {
    if (!(selected == -1)){
      if (selected - 1 > -1){
      selected--;
      Changehover(searchName.length, selected);
    }
  } else {
      selected = searchName.length - 1;
      Changehover(searchName.length, selected);
  }
}
}); 

  async function Showapp(first: boolean = false) {

    Read();

    // Checking if window is not focused
    if (!block){
    if (!(await appWindow.isFocused ())){
      blockhide = true;
      if (!(first)){
      all.classList.remove("invisible");
      console.log('Showing window');

      // Setting the value of input
      document.getElementsByTagName("input")[0].value = ""; 

      // Researching programs and files
      inputElement?.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: false
      }));
    }
    
      result.classList.add("AnimationShow");
      result.classList.remove("ResetShow");
      // Show
      await appWindow.setFocus();
      await inputElement?.focus();
      await appWindow.show();
      await appWindow.setPosition(new LogicalPosition(x, y)); 
      while (!(await appWindow.isFocused ())){
        if (!(await appWindow.isVisible())){
          break;
        }
        await appWindow.setFocus();
      }
      setTimeout(function(){
        blockhide = false;
    }, 500);
    }
  }
  }

document.getElementById('search')?.addEventListener('mousedown', async () => {
  await appWindow.startDragging();
});

inputElement?.addEventListener('blur', () => {
  inputElement.focus();
});

  await tauriEvent.listen<string>('show', async () => {
    await Showapp();
  });

  RegisterHotKey();
  async function RegisterHotKey() {
    try{
    await register('Alt+Space', async () => {
      await Showapp(); 
      block = false;
    }); 
    } catch (error) {
    console.error(error)
    await unregisterAll();
    block = true;
    const message = await invoke("cant_set_hotkey");
    if ( !(message) ) {
      block = false;
    } else {
      RegisterHotKey();
    }
    }
    }



  // Hide when unfocused (set focus have purpuse when clicking alt + space)
  async function Hideapp() {
    if (!blockhide){
        await appWindow.setFocus();
        await inputElement?.focus();
        await appWindow.hide();
        result.classList.remove("AnimationShow");
        result.classList.add("ResetShow");
      }
  }

  function OpeningAnimation(){
    const divElement = document.getElementById(`${selected}`)!;
    divElement.children[0].classList.add("AnimtionOpening"); 
    const image = divElement.children[0].children[0] as HTMLImageElement;
    image.src = 'spinner.svg';
    Changehover(searchName.length, -1);
  }

  document.addEventListener('keydown', async (event) => {
    if (event.key == 'Escape') {
      await Hideapp();
  }
  if (event.key == 'Enter'){
    invoke("open", {
      number: searchNumber[selected],
      whataction: otherAction.toString()
    });
    OpeningAnimation();
  }
}); 

  await appWindow.onFocusChanged(async () => {
    if (!(await appWindow.isFocused ())){
      await Hideapp();
    }
  })
  
  // When typing do...
  inputElement?.addEventListener("input", async function() {
  if (alreadySearching == true) {return;}
  alreadySearching = true;
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
      await appWindow.setSize(new LogicalSize(825 * settings.scale / 100, 92 * settings.scale / 100));
      
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
      await appWindow.setSize(new LogicalSize(825 * settings.scale / 100, heightApp * settings.scale / 100));

      
  // Reversing list
    searchNumber.reverse();
    searchName.reverse();
    searchType.reverse();

    let image = "/program.svg";

  // Cloning and filling 'searchName' the 'programDiv' and 'dirDiv'
      for (let i = 0; message.length / 2 > i; i++){
        const name: any = searchName[i];
        const clone = document.getElementById("clone")!;
        if (name !== undefined){
        // 'programDiv'
          if (searchType[i] == "0"){
            const clonepro = programDiv.cloneNode(true) as HTMLElement;
            clonepro.id = i.toString();
            clonepro.children[1].children[0].textContent = name.toString();

            image = await convertFileSrc("C:/Users/" + username + "/AppData/Roaming/arcrun/icons/" + searchNumber[i] + ".ico")

            const imageelement = clonepro.children[0].children[0] as HTMLImageElement;

            imageelement.src = image;

            imageelement.addEventListener("error", () => {
              imageelement.src = "/program.svg"
            })

            clonepro.children[2].children[0].addEventListener('mouseenter', function() {
              otherAction = 1;
            });
            clonepro.children[2].children[1].addEventListener('mouseenter', function() {
              otherAction = 2;
            });
            clonepro.children[2].addEventListener('mouseleave', function() {
              otherAction = 0;
            });
            clonepro.style.display = "flex";
            clone_list.push(clonepro);
            programDiv.parentNode!.insertBefore(clonepro, clone.nextSibling);
          }
          if (searchType[i] == "1"){
            // 'dirDiv'
            const clonedir = dirDiv.cloneNode(true) as HTMLElement;
            clonedir.id = i.toString();
            clonedir.children[1].children[0].textContent = name.toString();
            clonedir.children[2].children[0].addEventListener('mouseenter', function() {
              otherAction = 2;
            });
            clonedir.children[2].addEventListener('mouseleave', function() {
              otherAction = 0;
            });
            clonedir.style.display = "flex";
            clone_list.push(clonedir);
            dirDiv.parentNode!.insertBefore(clonedir, clone.nextSibling);
          }
        }
      }
    }
    
    for (let i = 0; i <= searchName.length - 1; i++) {
      const divElement = document.getElementById(`${i}`)!;
      divElement.addEventListener('click', function() {
        console.log(searchNumber[i]);
        selected = i;
          invoke("open", {
            number: searchNumber[i],
            whataction: otherAction.toString()
          });
          OpeningAnimation();
      });
      divElement.addEventListener('mouseenter', function() {
        selected = i;
        Changehover(searchName.length, selected);
      });
      divElement.addEventListener('mouseleave', function() {
        selected = -1;
        Changehover(searchName.length, selected);
      });
    }
    
    selected = searchName.length - 1;
    Changehover(searchName.length, selected, true);

    // // Change position    
    // await appWindow.setPosition(new LogicalPosition(x, y));
    alreadySearching = false;
  
    if (all.offsetHeight * ( 50 / 200 - (settings.scale - 50) / 200) > 0){
      all.style.top = `-${all.offsetHeight * ( 50 / 200 - (settings.scale - 50) / 200)}px`
    } else {
      all.style.top = `${all.offsetHeight * ( 50 / 200 - (settings.scale - 50) / 200) * -1}px`
    }
    x = (window.screen.width / 2 - window.innerWidth / 2) * settings.left;
    y = ((window.screen.height / 5) / window.devicePixelRatio) / (settings.scale / 100) * settings.top;
    
  });
});
useOnDocument(
  'keydown',
  $((event) => {
    if ([38, 40].includes(event.keyCode)) {
      event.preventDefault();
  }
  })
);

  return (
    <>
    <div id="all" style={`--scale: ${settings.scale / 100};`} class={`invisible select-none searchbar-set relative`}>
      <div id='check' class='invisible text-[0px]' />
        <div id="search" class='bg-gray-200 relative rounded-[20px] text-gray border-2 border-gray-300 h-[90px] w-[800px] left-1/2 -translate-x-1/2 z-20'> 
          <div class='flex w-full h-full'>
            <div class='ml-2 h-[98%] w-20 '>
              <Image width={47} height={47} class="opacity-100 top-1/2 -translate-y-1/2 relative left-1/2 -translate-x-1/2" src={settings.icon} />
            </div> 
            <div class='w-full'> 
              <input id="input" placeholder={settings.text} autocomplete="off" class='font-roboto text-[40px] bg-transparent text-black px-2 h-full border-transparent w-[100%] relative top-1/2 -translate-y-1/2 focus:outline-none' />
            </div>
            <div class='bg-gradient-to-r from-transparent via-gray-200/70 to-gray-200 absolute w-12 h-full right-0 mr-5' />
              <div class='w-4' />
            </div>
        </div>
        
        <div id='result' class='hidden bg-white/0 mt-[0.5rem] h-5/6 w-full relative bottom-0 rounded-[20px] z-10'>
          <div id='clone' class='flex flex-col'></div>
        {/* div jako program */}
        <div id='programMain' class='hidden mb-1 relative shadow-lg left-1/2 -translate-x-1/2 transition-all duration-200 cursor-pointer rounded-[10px] w-[795px] h-[75px] bg-gray-200 overflow-hidden
          before:duration-100 before:left-1/2 before:-translate-x-1/2 before:rounded-[9px] before:h-full before:delay-75 before:transition-all before:absolute'>
            <div class='ml-1 h-[98%] w-14'>
              <Image width={38} height={38} class="relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" src="/program.svg" /> 
            </div>
            <div class='w-[93%]'>
                <div id='program' class='relative top-1/2 -translate-y-1/2 pl-1 pr-2 pt-[0px] font-roboto font-normal text-[28px] truncate'></div>
            </div>
            <div class='absolute -right-6 opacity-0 duration-[175ms] hover:opacity-100 hover:right-0 flex  h-full bg-gray-200 shadow-[0_0px_10px_10px_rgba(229,231,235,1)] z-20'>
              <div class='px-3 hover:invert duration-150 transition-all
               before:duration-150 before:rounded-[0px] before:hover:rounded-full before:transition-all before:top-1/2 before:translate-y-[-50%] before:left-[32px] before:translate-x-[-50%] b before:w-0 before:h-0 before:bg-[#2f64f7]/0 before:invert before:absolute before:hover:w-[70px] before:hover:h-[70px] before:hover:bg-[#2f64f7]'>
                <Image width={40} height={40} class="relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" src="/openfolder.svg" />
                </div>
              <div class='pl-3 pr-5 hover:invert duration-150 transition-all
               before:duration-150 before:rounded-[0px] before:hover:rounded-full before:transition-all before:top-1/2 before:translate-y-[-50%] before:left-[32px] before:translate-x-[-50%] b before:w-0 before:h-0 before:bg-[#2f64f7]/0 before:invert before:absolute before:hover:w-[70px] before:hover:h-[70px] before:hover:bg-[#2f64f7]'>
                <Image width={40} height={40} class="relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" src="/moreabout.svg" />
                </div>
            </div>
            <div class="absolute right-0 h-full w-16 z-10">
              <Image width={36} height={36} class="relative top-1/2 left-0 -translate-y-1/2" src="/arrow2.svg" />
            </div>
          </div>
          
          {/* div jako folder */}
          <div id='dirMain' class='hidden mb-1 relative shadow-lg left-1/2 -translate-x-1/2 transition-all duration-200 cursor-pointer rounded-[10px] w-[795px] h-[50px] bg-gray-200 overflow-hidden 
          before:duration-100 before:left-1/2 before:-translate-x-1/2 before:rounded-[9px] before:hover:w-full before:h-full before:delay-75 before:transition-all before:absolute'>
            <div class='h-[98%] w-14 ml-1'>
              <Image width={30} height={30} class="relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" src="/folder.svg" />
            </div>
            <div class='w-[93%]'>
              <div class='relative top-1/2 -translate-y-1/2 px-2 pt-[1px] font-roboto font-normal text-[24px] truncate'></div>
            </div>
            <div class='absolute flex -right-6 opacity-0 duration-[175ms] hover:opacity-100 hover:right-0 h-full bg-gray-200  shadow-[0_0px_10px_10px_rgba(229,231,235,1)] z-20'>
              <div class='px-[16px] hover:invert duration-150 transition-all
               before:duration-150 before:rounded-[0px] before:hover:rounded-full before:transition-all before:top-1/2 before:translate-y-[-50%] before:left-[32px] before:translate-x-[-50%] b before:w-0 before:h-0 before:bg-[#2f64f7]/0 before:invert before:absolute before:hover:w-[52px] before:hover:h-[52px] before:hover:bg-[#2f64f7]'>
                <Image width={32} height={32} class="relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" src="/moreabout.svg" />
                </div>
            </div>
            <div class="absolute right-0 h-full w-16 z-10">
              <Image width={28} height={28} class="relative top-1/2 left-0 -translate-y-1/2" src="/arrow2.svg" />
            </div>
          </div>
        </div>
      </div>
      <Image width={16} height={16} src="spinner.svg" class='opacity-0' />
    </>
  );
});

  export const head: DocumentHead = {
  title: "ArcRun Beta",
  meta: [
    {
      name: "ArcRun Beta",
      content: "ArcRun Beta",
    },
  ],
};
