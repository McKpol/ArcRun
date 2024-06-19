import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Image } from '@unpic/qwik';
import { appWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api";
import { unregisterAll, register } from "@tauri-apps/api/globalShortcut";
import * as tauriEvent from '@tauri-apps/api/event';
import { convertFileSrc } from "@tauri-apps/api/tauri";
import "./style.css";

interface Set{
  top: number;
  fat: number;
  minimalistic: number;
}

interface Globals{
  alreadySearching: boolean;
  clone_list: HTMLElement[];
  searchNumber: string[];
  searchName: string[];
  searchType: string[];
  username: string;
}

export default component$(() => {
  const set = useStore<Set>({
    top: 19.5,
    fat: 2,
    minimalistic: 1
  });

  const global = useStore<Globals>({
    alreadySearching: false,
    clone_list: [],
    searchNumber: [],
    searchName: [],
    searchType: [],
    username: ""
  });

  useVisibleTask$(async () => {

    await unregisterAll();

    global.username = await invoke("get_username");
    const searchingbox = document.getElementById("searchingbox") as HTMLInputElement;
    const search = document.getElementsByTagName("search")[0] as HTMLElement;
    
    search.classList.add("hidden");
    async function Showapp(){await appWindow.show();await appWindow.setFocus();}
    async function Hideapp() {
      searchingbox.value = "";search.classList.add("hidden");await appWindow.hide();await appWindow.setFocus();
    }

    await tauriEvent.listen<string>('show', async () => {await Showapp();});

    document.addEventListener('keydown', async (event) => {if (event.key == 'Escape') {await Hideapp();}});
    
    await appWindow.onFocusChanged(async () => {if (!(await appWindow.isFocused ())){await Hideapp();}})

    RegisterHotKey();

    async function RegisterHotKey() {
      try{
      await register('Alt+Space', async () => {
        await Showapp(); 
      }); 
      } catch (error) {console.error(error);
      
        await unregisterAll();
        const message = await invoke("cant_set_hotkey");
        if (message) {RegisterHotKey();}}} 
 

      // document.getElementsByTagName("line")[0].style.width = String(document.getElementsByTagName("searchbox")[0].scrollWidth / 1.1) + "px";
    })

  return (
    <>
      <all class="absolute w-full h-full flex flex-col select-none">
        <top style={`height: ${set.top/4}rem`} class={`flex flex-row flex-none`}>
          {/* <line style={`left: ${(set.top+1)/4}rem; top: ${set.top/5}rem`} class="w-full h-0.5 bg-white absolute" /> */}
          <logo style={`width: ${set.top/4}rem;`} class={`bg-black/70 flex-none h-full rounded-md rounded-tl-[2.1rem] flex place-content-center items-center cursor-move`} onMouseDown$={async () => {await appWindow.startDragging();}}><Image height={set.top * 2.5} width={set.top * 2.5} src="/logo white.png" /></logo>
          <searchbox class="mx-1 bg-black/70 h-full w-full rounded-md"><input id="searchingbox" autocomplete="off" placeholder="Start typing..." class="bg-transparent cursor-default text-center outline-none border-b-white/50 pr-5 pt-3 text-white font-medium translate-x-3 h-[82%] w-[100%] text-4xl" onInput$={async (e) => {


          if (global.alreadySearching) {return;}
            global.alreadySearching = true;
            
            const result = document.getElementsByTagName("result")[0] as HTMLElement;
            // const otherresult = document.getElementsByTagName("otherresult")[0] as HTMLElement;
            const input = e.target as HTMLInputElement;
            const search = document.getElementsByTagName("search")[0] as HTMLElement;

            const message: string[] = await invoke("search", {
              search: input.value.toLowerCase(),
            }); 
            
            for (let i = 0; global.clone_list.length > i; i++){
              global.clone_list[i].remove();
            }
            global.clone_list.length = 0;
            global.searchName.length = 0;
            global.searchNumber.length = 0;
            global.searchType.length = 0;
        
              for (let i = 0; i < message.length; i += 3) {
                global.searchNumber.push(message[i]);
                global.searchName.push(message[i + 1]);
                global.searchType.push(message[i + 2]);
            }

            if (global.searchNumber.length == 0 ) {global.alreadySearching = false;return;}
            
            global.searchNumber.reverse();
            global.searchName.reverse();
            global.searchType.reverse();

            result.getElementsByTagName("name")[0].textContent = global.searchName[0];
            
                const placeholderimg = document.getElementById("placeimgr") as HTMLImageElement; 
                const resultimg = document.getElementById("imgr") as HTMLImageElement; 
                placeholderimg.classList.remove("hidden");
                if (global.searchType[0] == "1") {
                  placeholderimg.src = "/folder.svg";
                  search.getElementsByTagName("folder")[0].classList.add("hidden");
                  resultimg.classList.add("hidden");

                }
                if (global.searchType[0] == "0") {
                  placeholderimg.src = "/program.svg";
                  search.getElementsByTagName("folder")[0].classList.remove("hidden");
                  const image = await convertFileSrc("C:/Users/" + global.username + "/AppData/Roaming/arcrun/icons/" + global.searchNumber[0] + ".ico");
                  
                  resultimg.classList.remove("invert");
                  resultimg.src = image;
                  resultimg.classList.add("hidden");
  
                  resultimg.addEventListener("load", () => {
                    placeholderimg.classList.add("hidden");
                    resultimg.classList.remove("hidden");
                  })
                }
            search.classList.remove("hidden");
            placeholderimg.classList.remove("AnimtionOpening");
            const otherresult = document.getElementsByTagName("otherresult")[0] as HTMLElement;
                
            for (let i = 1; global.searchName.length > i; i++){
              const name: string = global.searchName[i];
              const number: string = global.searchNumber[i];
              const type: string = global.searchType[i];

              const clone = otherresult.cloneNode(true) as HTMLElement;
              const img = clone.children[0].children[1].children[0].children[0] as HTMLImageElement;
              const placeimg = clone.children[0].children[1].children[0].children[1] as HTMLImageElement;
              clone.classList.remove("hidden");
              clone.id = i.toString();
              clone.children[0].children[1].children[1].textContent = name;
              
              if (type == "1"){
                img.src = "/folder.svg";
                placeimg.classList.add("hidden");
                clone.children[0].children[2].children[0].classList.add("hidden");
              } else {
                img.src = "/program.svg";
                img.src = await convertFileSrc("C:/Users/" + global.username + "/AppData/Roaming/arcrun/icons/" + global.searchNumber[i] + ".ico");
                img.classList.remove("invert");
                img.classList.add("hidden");
                img.addEventListener("load", () =>{
                  placeimg.classList.add("hidden");
                  img.classList.remove("hidden");
                })
              }

              clone.children[0].children[1].addEventListener("mousedown", () => {
                invoke("open", {
                  number: number,
                  whataction: "0"
                });
                img.classList.add("hidden");
                placeimg.classList.add("AnimtionOpening");
                placeimg.classList.remove("hidden");
                placeimg.src = "/spinner.svg";
              })
              clone.children[0].children[2].children[0].addEventListener("mousedown", () => {
                invoke("open", {
                  number: number,
                  whataction: "1"
                });
                img.classList.add("hidden");
                placeimg.classList.add("AnimtionOpening");
                placeimg.classList.remove("hidden");
                placeimg.src = "/spinner.svg";
              })
              clone.children[0].children[2].children[1].addEventListener("mousedown", () => {
                invoke("open", {
                  number: number,
                  whataction: "2"
                });
                img.classList.add("hidden");
                placeimg.classList.add("AnimtionOpening");
                placeimg.classList.remove("hidden");
                placeimg.src = "/spinner.svg";
              })

              global.clone_list.push(clone);
              console.log(otherresult.parentNode!.insertBefore(clone, document.getElementsByTagName("otherresult")[0]));
              // otherresult.children[0].children[1].children[1] NAME
              // otherresult.children[0].children[1].children[0].children[0] IMG
            }

            console.log((global.clone_list.length - 1) * 40);
            console.log(document.getElementsByTagName("other")[0].scrollHeight)
            console.log(document.getElementsByTagName("search")[0].clientHeight)
            global.alreadySearching = false;
            }} window:onkeydown$={(e:KeyboardEvent) => {const element = document.getElementById("searchingbox") as HTMLInputElement; if(e.ctrlKey == false  && e.altKey == false &&  element != document.activeElement && element.value == "" && e.key.length == 1){element.value = e.key; element.focus()}}} onBlur$={(e) => {const element = e.target as HTMLElement; element.focus();}}/></searchbox>
          <filtr style={`width: ${set.top/4}rem; border-width: ${set.fat}px;`} class={`bg-black/70 hover:rotate-1 flex-none h-full rounded-lg rounded-tr-[2.1rem] flex place-content-center items-center hover:border-[#0c75ff] hover:rounded-lg border-white/50 duration-100`}><Image class="invert" height={set.top * 1.8} width={set.top * 1.8} src="/filtr.svg" /></filtr>
        </top>
        <search class="flex flex-col h-full w-full bg-black/70 rounded-t-lg rounded-b-[2.1rem] mt-[0.25rem]">

          <mainr class="mt-[0.8rem] w-full h-[3.65rem] flex flex-row flex-none flex-grow-0">
            <heart class="w-[2.5rem] ml-[0.2rem] mr-[0.05rem] h-[3rem] self-center flex place-content-center items-center flex-none rounded-sm duration-200 hover:h-[2.5rem] hover:rounded-3xl hover:bg-red-500/50"><Image src="/heart.svg" height={32} width={32} class="invert hover:-rotate-3 duration-100" /></heart>

            <result onMouseDown$={() => {
              invoke("open", {number: global.searchNumber[0], whataction: "0"}) 
              const img = document.getElementById("imgr") as HTMLImageElement;
              const placeimg = document.getElementById("placeimgr") as HTMLImageElement;
              img.classList.add("hidden");
              placeimg.classList.add("AnimtionOpening");
              placeimg.classList.remove("hidden");
              placeimg.src = "/spinner.svg";}} style={`border-width: ${set.fat}px`} class="h-full w-full bg-white/5 rounded-md border-white/50 duration-100 hover:rounded-xl hover:border-[#0c75ff] flex flex-row overflow-hidden">
            
              <icon class="place-content-center ml-3 items-center w-[32px] flex flex-none"><Image id="imgr" src="/program.svg" height={32} width={32} class="invert hidden" /><Image id="placeimgr" src="/program.svg" height={32} width={32} class="invert" /></icon>
              <name class="text-white h-full place-content-center items-center text-3xl ml-3 flex-none">-</name>
            </result>
            
            <folder onMouseDown$={() => {invoke("open", {number: global.searchNumber[0], whataction: "1"})
             const img = document.getElementById("imgr") as HTMLImageElement;
             const placeimg = document.getElementById("placeimgr") as HTMLImageElement;
             img.classList.add("hidden");
             placeimg.classList.add("AnimtionOpening");
             placeimg.classList.remove("hidden");
             placeimg.src = "/spinner.svg";}} style={`border-width: ${set.fat}px`} class="h-full hover:rotate-2 w-[3.65rem] ml-1 flex-none rounded-md bg-white/5 border-white/50 duration-100 hover:rounded-xl hover:border-[#0c75ff] flex place-content-center items-center"><Image src="/folder.svg" height={42} width={42} class="invert"/></folder>
            
            <info onMouseDown$={() => {invoke("open", {number: global.searchNumber[0], whataction: "2"})
             const img = document.getElementById("imgr") as HTMLImageElement;
             const placeimg = document.getElementById("placeimgr") as HTMLImageElement;
             img.classList.add("hidden");
             placeimg.classList.add("AnimtionOpening");
             placeimg.classList.remove("hidden");
             placeimg.src = "/spinner.svg";}} style={`border-width: ${set.fat}px`} class="h-full hover:rotate-2  w-[3.65rem] ml-1 rounded-md flex-none mr-2 bg-white/5 border-white/50 duration-100 hover:rounded-xl hover:border-[#0c75ff] flex place-content-center items-center"><Image src="/moreabout.svg" height={42} width={42} class="invert"/></info>
          </mainr>

          <other style={`border-top-width: ${set.fat * ((set.minimalistic - 1) / - 1)}px;`} class="flex  flex-col flex-none mt-2 border-y-white/50 overflow-hidden overflow-y-scroll h-full">
            
            <otherresult class="hidden">
              <Result fat={set.fat} name={"Visual studio code"} icon={"/82.ico"} />
            </otherresult>
          

          </other>
        </search>
      </all>
    </>
  );
});

  export const Result = component$((props: {fat: number, name: string, icon: string}) => {
    return(
      <result onMouseEnter$={(e) => {
        const div = e.target as HTMLElement;
        if (div.getElementsByTagName("folder")[0].classList.contains("hidden")){
          div.getElementsByTagName("sel")[0].classList.add("enterfolder");
        } else {
          div.getElementsByTagName("sel")[0].classList.add("enter");
        }
        div.getElementsByTagName("sel")[0].classList.remove("exit");
        
      }} onMouseLeave$={(e) => {
        const div = e.target as HTMLElement;
        div.getElementsByTagName("sel")[0].classList.add("exit");
        if (div.getElementsByTagName("folder")[0].classList.contains("hidden")){
          div.getElementsByTagName("sel")[0].classList.remove("enterfolder");
        } else {
          div.getElementsByTagName("sel")[0].classList.remove("enter");
        }
      }} class="flex flex-row pt-2">
      <heart class="flex-none w-[2rem] h-[2rem] ml-2 self-center flex place-content-center items-center" onMouseEnter$={(e) => { const div = e.target as HTMLElement; console.log(div.getElementsByTagName("image")[0]) }}><heartbaground class="duration-100 flex-none -m-[1.25rem] translate-x-[1rem] rounded-none hover:rounded-3xl hover:h-[2.5rem] hover:bg-red-500/50 w-[2.5rem] h-[3rem]"></heartbaground><Image src="/heart.svg" height={32} width={32} class="invert duration-100 pointer-events-none" /></heart>
      
      <box style={`border-width: ${props.fat}px`} class="w-full h-8 relative flex flex-row border-white/50 bg-white/5 ml-1 rounded-md hover:rounded-xl hover:border-[#0c75ff] duration-100 overflow-hidden mr-1">
        <icon class="place-content-center ml-3 items-center w-[32px] flex flex-none h-full"><Image src={props.icon} height={24} width={24} class="invert" /><Image src={"/program.svg"} height={24} width={24} class="invert" /></icon>
        <name class="text-white h-full place-content-center items-center text-[20px] ml-3 flex-none">{props.name}</name>
      </box>

      <sel class="flex flex-row flex-none duration-150 transition-all exit">
        <folder style={`border-width: ${props.fat}px`} class="w-[3.65rem] h-8 border-white/50 bg-white/5 flex place-content-center items-center flex-none rounded-md hover:rounded-xl hover:rotate-2 hover:border-[#0c75ff] duration-100"><Image src="/folder.svg" height={26} width={26} class="invert"/></folder>
        <icon style={`border-width: ${props.fat}px`} class="w-[3.65rem] ml-1 h-8 border-white/50 bg-white/5 mr-[0.5rem] flex-none rounded-md flex place-content-center items-center hover:rotate-2 hover:rounded-xl hover:border-[#0c75ff] duration-100"><Image src="/moreabout.svg" height={26} width={26} class="invert"/></icon>
      </sel>
      
    </result>
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
