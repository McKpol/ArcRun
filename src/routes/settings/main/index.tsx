import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { Switch, Slider, Textbox } from '..';
import { invoke } from "@tauri-apps/api";
import { Image } from '@unpic/qwik';
import { open } from "@tauri-apps/api/dialog"
import { convertFileSrc } from '@tauri-apps/api/tauri';
 
interface Settings{
  autostart: boolean;
  scale: number;
  top: number;
  left: number;
  text: string;
  icon: string;
}

interface Title{
  autostart: string;
  scale: string;
  top: string;
  left: string;
  text: string;
  icon: string;
}

interface Description{
  autostart: string;
  scale: string;
  top: string;
  left: string;
  text: string;
  icon: string;
}

interface Temp{
  number: number;
  mousedown: boolean;
  hover: boolean;
  text: number;
  icon: number;
  refresh: boolean;
}

interface Icon{
  deafult: [string, string];
  custom: [string, string];
}

export const ContentMain = component$((props: {visible: boolean}) => {
  const icon = useStore<Icon>({
    deafult: ["Deafult", "/logo new small.png"],
    custom: ["Custom", "/image.svg"]
  })

  const settings = useStore<Settings>({
    autostart: false,
    scale: 50,
    top: 50,
    left: 50,
    text: "Search with ArcRun",
    icon: "deafult"
  });
  const temp = useStore<Temp>({
    number: 0,
    mousedown: false,
    hover: false,
    text: 0,
    icon: 0,
    refresh: false
  });
  const title = useStore<Title>({
    autostart: "Start on login",
    scale: "Scale",
    top: "Position Y",
    left: "Position X",
    text: "Welcome message",
    icon: "Icon"
  });
  const description = useStore<Description>({
    autostart: "Program will start after you log on the system.",
    scale: "Change scale of searchbar.",
    top: "How high should be searchbar.",
    left: "Where should be searchbar.",
    text: "Set your welcome text in a searchbar.",
    icon: "Set your own icon."
  });

  useVisibleTask$(async () => {

    async function set() {
    settings.autostart = await invoke("check_auto_start"); 
    let message: string;

    message = await invoke("read_settings", {
      line: 0
    });

    settings.scale = Number(message) * 100 / 8;

    message = await invoke("read_settings", {
      line: 1
    });

    settings.top = Math.round(Number(message) * 100 / 20);

    message = await invoke("read_settings", {
      line: 2
    });

    settings.left = Math.round(Number(message) * 100 / 20);

    message = await invoke("read_settings", {
      line: 3
    });

    console.log(message);
    settings.text = message;

    const customimage = await invoke("read_settings", {
      line: 4
    }) as string;

    message = await invoke("read_settings", {
      line: 5
    });

    if(message == "custom"){
      icon.custom[1] = convertFileSrc(customimage);
    } else {
      icon.custom[1] = "/image.svg";
    }

    settings.icon = message;
  }
  await set();
  
  setInterval(async () => {
    if (props.visible && temp.refresh) {
      temp.refresh = false;
      await set();
    } else if ((!(props.visible)) && (!(temp.refresh)))  {
      temp.refresh = true;
    }
  }, 50)

    document.getElementsByTagName("settings")[0].addEventListener('mousedown', function() {
      temp.mousedown = true;
    })
    
    document.getElementsByTagName("settings")[0].addEventListener('mouseup', function() {
      temp.mousedown = false;
    })

    let temp_texbox = document.getElementsByTagName("textbox")[0] as HTMLElement;
    temp.text = temp_texbox.offsetHeight;
    temp_texbox = document.getElementsByTagName("textbox")[0] as HTMLElement;
    temp.icon = temp_texbox.offsetHeight;
  });
  return(
  <>
  <settings class='flex flex-col overflow-scroll pb-12 select-none'>

    <switch class='flex flex-col' onMouseEnter$={() => temp.hover = true} onMouseLeave$={() => temp.hover = false} onMouseDown$={async () => {await invoke("set_auto_start"); const message: boolean = await invoke("check_auto_start"); settings.autostart = message;}}>
      <Switch true={settings.autostart} title={title.autostart} description={description.autostart} mousedown={temp.hover} />
    </switch>

    <slider class='flex flex-col' onMouseEnter$={() => {const slide = document.getElementsByTagName("Slider")[0] as HTMLElement; temp.number = slide.offsetHeight;}}>
      
      <controlpad style={`height: ${temp.number}px; margin-bottom: -${temp.number}px; margin-left:auto; right: 0.8rem;`} class={`w-[9.67rem] relative right-16 154.72 z-20`}
      onMouseDown$={async (event) => {const oldsetting = settings.scale; settings.scale = Math.round(event.offsetX / 154.72 * 100 / 12.5) * 12.5; if (oldsetting != settings.scale){ const con = (settings.scale * 8 / 100); await invoke("write_settings", {line: 0,content: con.toString()});}}} 
      onMouseMove$={async (event) => {const oldsetting = settings.scale;if (temp.mousedown){settings.scale = Math.round(event.offsetX / 154.72 * 100 / 12.5) * 12.5;}if (oldsetting != settings.scale){const con = (settings.scale * 8 / 100); await invoke("write_settings", {line: 0,content: con.toString()});}}}>
        
        <p class="text-center font-bold">{settings.scale + 50}%</p></controlpad>
      
      <Slider percentage={settings.scale} title={title.scale} description={description.scale} />
    </slider>

    <slider class='flex flex-col' onMouseEnter$={() => {const slide = document.getElementsByTagName("Slider")[1] as HTMLElement; temp.number = slide.offsetHeight;}}>
      
      <controlpad style={`height: ${temp.number}px; margin-bottom: -${temp.number}px; margin-left:auto; right: 0.8rem;`} class={`w-[9.67rem] relative right-16 154.72 z-20`}
      onMouseDown$={async (event) => {const oldsetting = settings.top; settings.top = Math.round(event.offsetX / 154.72 * 100 / 5) * 5; if (oldsetting != settings.top){ const con = settings.top * 20 / 100; await invoke("write_settings", {line: 1,content: con.toString()});}}} 
      onMouseMove$={async (event) => {const oldsetting = settings.top;if (temp.mousedown){settings.top = Math.round(event.offsetX / 154.72 * 100 / 5) * 5;}if (oldsetting != settings.top){const con = settings.top * 20 / 100; await invoke("write_settings", {line: 1,content: con.toString()});}}}>
        
        <p class="text-center font-bold">{settings.top * 2}%</p></controlpad>
      
      <Slider percentage={settings.top} title={title.top} description={description.top} />
    </slider>

    <slider class='flex flex-col' onMouseEnter$={() => {const slide = document.getElementsByTagName("Slider")[2] as HTMLElement; temp.number = slide.offsetHeight;}}>
      
      <controlpad style={`height: ${temp.number}px; margin-bottom: -${temp.number}px; margin-left:auto; right: 0.8rem;`} class={`w-[9.67rem] relative right-16 154.72 z-20`}
      onMouseDown$={async (event) => {const oldsetting = settings.left; settings.left = Math.round(event.offsetX / 154.72 * 100 / 5) * 5; if (oldsetting != settings.left){ const con = settings.left * 20 / 100; await invoke("write_settings", {line: 2,content: con.toString()});}}} 
      onMouseMove$={async (event) => {const oldsetting = settings.left;if (temp.mousedown){settings.left = Math.round(event.offsetX / 154.72 * 100 / 5) * 5;}if (oldsetting != settings.left){const con = settings.left * 20 / 100; await invoke("write_settings", {line: 2,content: con.toString()});}}}>
        
        <p class="text-center font-bold">{settings.left * 2}%</p></controlpad>
      
      <Slider percentage={settings.left} title={title.left} description={description.left} />
    </slider>

    <textbox class='flex flex-col'>

    <buttonspace style={`height: ${temp.icon}px; margin-bottom: -${temp.icon}px; margin-left:auto; right: 0.8rem;`} class='relative w-48 flex flex-col'>
      <dropdown
        onMouseEnter$={() => {const options = document.getElementsByTagName("sel")[0] as HTMLElement; options.style.display = "block"; }}
        onMouseLeave$={() => {const options = document.getElementsByTagName("sel")[0] as HTMLElement; options.style.display = "none";}}>
        <selected class='absolute top-1/2 -translate-y-1/2 hover:bg-blue-200 duration-100 bg-gray-200 shadow-inner w-48 rounded-md font-medium flex flex-row'><Image src={icon[(settings.icon as keyof Icon)][1]} width={18} height={18} class="translate-y-[20%] ml-2 mr-1" /><p>{icon[(settings.icon as keyof Icon)][0]}</p><Image src="/triangle.svg" width={12} height={12} class="absolute translate-y-[55%] left-auto right-0 mr-2 rotate-180" /> <div class="absolute w-48 top-1/2 translate-y-1/2 h-3" /></selected>
        <sel class='flex-col border-gray-200 border font-medium hidden overflow-hidden w-48 shadow-inner rounded-md bg-gray-100 m-0 pt-0 text leading-snug absolute top-[3.75rem] z-20'>
          <p class="hover:bg-blue-400 pl-2 duration-100 flex" onMouseDown$={async () => {if (settings.icon != "deafult") {settings.icon = "deafult"; await invoke("write_settings", {line: 5, content: settings.icon})}}}><Image src={icon.deafult[1]} width={18} height={18} class="translate-y-[20%] mx-1" />{icon.deafult[0]}</p>
          <p class="hover:bg-blue-400 pl-2 duration-100 flex" onMouseDown$={async () => {let message = await open({multiple: false, filters: [{name: "Images", extensions: ["png", "apng", "avif", "webp", "jpg", "jpeg", "gif", "svg"]}]}); if (message != null) {const con = message; message = message as string; message = convertFileSrc(message); icon.custom[1] = message; settings.icon = "custom"; await invoke("write_settings", {line: 4, content: con.toString()}); await invoke("write_settings", {line: 5, content: settings.icon})}}}><Image src={icon.custom[1]} width={18} height={18} class="translate-y-[20%] mx-1" />{icon.custom[0]}</p>
        </sel>
      </dropdown>
    </buttonspace>
      <Textbox title={title.icon} description={description.icon} />
    </textbox>

    <textbox class='flex flex-col'>

    <buttonspace style={`height: ${temp.text}px; margin-bottom: -${temp.text}px; margin-left:auto; right: 0.8rem;`} class='relative w-48 flex flex-col'>
      <input type="text" placeholder='Search with ArcRun' value={settings.text} class={`relative rounded-md top-1/2 font-medium -translate-y-1/2 bg-gray-200 shadow-inner border outline-none`} onKeyDown$={async () => {const con = document.getElementsByTagName("input")[0].value; await invoke("write_settings", {line: 3, content: con.toString()});}} />
    </buttonspace>
      <Textbox title={title.text} description={description.text} />
    </textbox>
  </settings>
  </>
  )
});

