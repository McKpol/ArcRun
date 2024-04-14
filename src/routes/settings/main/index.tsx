import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { Switch, Slider } from '../layout';
import { invoke } from "@tauri-apps/api";
 
interface Settings{
  autostart: boolean;
  scale: number;
  top: number;
}

interface Title{
  autostart: string;
  scale: string;
  top: string;
}

interface Description{
  autostart: string;
  scale: string;
  top: string;
}
interface Temp{
  number: number;
  mousedown: boolean;
  hover: boolean;
}

export default component$(() => {
  const settings = useStore<Settings>({
    autostart: false,
    scale: 50,
    top: 40
  });
  const temp = useStore<Temp>({
    number: 0,
    mousedown: false,
    hover: false
  });
  const title = useStore<Title>({
    autostart: "Start on login",
    scale: "Height",
    top: "Scale"
  });
  const description = useStore<Description>({
    autostart: "Program will start after you log on the system.",
    scale: "Change scale of search bar.",
    top: "How high should be search bar."
  });
  useVisibleTask$(async () => {
    settings.autostart = await invoke("check_auto_start"); 
    let message: String;

    message = await invoke("read_settings", {
      line: 0
    });

    settings.scale = Number(message) * 100 / 8;

    message = await invoke("read_settings", {
      line: 1
    });

    settings.top = Math.round(Number(message) * 100 / 10);

    document.body.onmousedown = function() {
      temp.mousedown = true;
    }
    
    document.body.onmouseup = function() {
      temp.mousedown = false;
    }

  });

  return(
  <>
  <settings class='flex flex-col overflow-scroll pb-12 select-none'>

    <switch class='flex flex-col' onMouseEnter$={() => temp.hover = true} onMouseLeave$={() => temp.hover = false} onMouseDown$={async () => {await invoke("set_auto_start"); const message: boolean = await invoke("check_auto_start"); settings.autostart = message;}}>
      <Switch true={settings.autostart} title={title.autostart} description={description.autostart} mousedown={temp.hover} />
    </switch>

    <slider class='flex flex-col' onMouseEnter$={() => {const slide = document.getElementsByTagName("slider")[0] as HTMLElement; temp.number = slide.offsetHeight;}}>
      
      <controlpad style={`height: ${temp.number}px`} class={`w-[9.67rem] absolute right-16 154.72 z-20`}
      onMouseDown$={async (event) => {const oldsetting = settings.scale; settings.scale = Math.round(event.offsetX / 154.72 * 100 / 12.5) * 12.5; if (oldsetting != settings.scale){ const con = (settings.scale * 8 / 100); await invoke("write_settings", {line: 0,content: con.toString()});}}} 
      onMouseMove$={async (event) => {const oldsetting = settings.scale;if (temp.mousedown){settings.scale = Math.round(event.offsetX / 154.72 * 100 / 12.5) * 12.5;}if (oldsetting != settings.scale){const con = (settings.scale * 8 / 100); await invoke("write_settings", {line: 0,content: con.toString()});}}}>
        
        <p class="text-center font-bold">{settings.scale + 50}%</p></controlpad>
      
      <Slider percentage={settings.scale} title={title.scale} description={description.scale} />
    </slider>

    <slider class='flex flex-col' onMouseEnter$={() => {const slide = document.getElementsByTagName("slider")[0] as HTMLElement; temp.number = slide.offsetHeight;}}>
      
      <controlpad style={`height: ${temp.number}px`} class={`w-[9.67rem] absolute right-16 154.72 z-20`}
      onMouseDown$={async (event) => {const oldsetting = settings.top; settings.top = Math.round(event.offsetX / 154.72 * 100 / 10) * 10; if (oldsetting != settings.top){ const con = settings.top * 10 / 100; await invoke("write_settings", {line: 1,content: con.toString()});}}} 
      onMouseMove$={async (event) => {const oldsetting = settings.top;if (temp.mousedown){settings.top = Math.round(event.offsetX / 154.72 * 100 / 10) * 10;}if (oldsetting != settings.top){const con = settings.top * 10 / 100; await invoke("write_settings", {line: 1,content: con.toString()});}}}>
        
        <p class="text-center font-bold">{(settings.top / 10) + 2}</p></controlpad>
      
      <Slider percentage={settings.top} title={title.top} description={description.top} />
    </slider>
  </settings>
  </>
  )
});

