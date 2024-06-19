import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { Image } from '@unpic/qwik';
import { appWindow } from '@tauri-apps/api/window';
import { ContentMain } from './main/index';
import { ContentData } from './data/index';
import './style.css';

interface State {
  main: string;
  algorithm: string;
  data: string;
}

interface Image {
  main: string;
  algorithm: string;
  data: string;
}

interface Site {
  main: boolean;
  algorithm: boolean;
  data: boolean;
}

interface Nav {
  hover: boolean;
}

export default component$(() => {

  const name = useStore<State>({
    main: "Application",
    algorithm: "Algorithm",
    data: "Data"
  });

  const image = useStore<Image>({
    main: "/app.svg",
    algorithm: "/algorithm.svg",
    data: "/data.svg"
  });

  const site = useStore<Site>({
    main: true,
    algorithm: false,
    data: false
  });

  const nav = useStore<Nav>({
    hover: false,
  });

  let showMain = "hidden";
  let showData = "hidden";

  if (site.main){
    showMain = "flex";
  }
  if (site.data){
    showData = "flex";
  }

  useVisibleTask$(async () => {
    const leftbarElement = document.getElementsByTagName("leftbar")[0] as HTMLElement;

    leftbarElement.addEventListener('mouseover', () => {
      leftbarElement.classList.add("AnimationOpeningNavBarhover");
    });

    leftbarElement.addEventListener('mouseout', () => {
      leftbarElement.classList.remove("AnimationOpeningNavBarhover");
    });

    document.getElementsByTagName("minimizebutton")[0].addEventListener("click", async () => {
      await appWindow.minimize();
    })
    document.getElementsByTagName("closebutton")[0].addEventListener("click", async () => {
      await appWindow.hide();
    })
    document.getElementsByTagName("dragging")[0].addEventListener("mousedown", async () => {
      await appWindow.startDragging();
    })
  });

  return(
    <>
    <container class="bg-gray-50 h-full w-full absolute rounded-3xl overflow-hidden">
      <topbar class="bg-white duration-200 absolute w-full h-8 shadow-md z-20 select-none">
        <dragging class="w-full h-full absolute right-0 mr-24 z-20" />
        <logo class="absolute ml-3"><Image width={24} height={24} src="/logo new small.png" class="mt-1 mr-2" /></logo>
        <name class="absolute h-full left-1/2 -translate-x-1/2"><p class="mt-[0.20rem] mr-2">ArcRun - Settings</p></name>
        <buttons class="absolute h-full w-24 right-0 flex">
        <minimizebutton class="hover:bg-blue-500 flex-1 h-full w-full transition-all duration-100"><Image width={36} height={36} src="/minimize.svg" class="relative h-full -bottom-1 left-1/2 -translate-x-1/2 stroke-1" /></minimizebutton>
        <closebutton class="hover:bg-red-500 flex-1 h-full w-full transition-all duration-100"><Image width={38} height={38} src="/close.svg" class="h-full stroke-1" /></closebutton>
        </buttons>
      </topbar>

      <leftbar class="overflow-hidden bg-white shadow-md border-gray-200 w-[3rem] absolute h-full mt-8 z-20 select-none transition-all duration-200" onMouseEnter$={() => nav.hover = true} onMouseLeave$={() => nav.hover = false}>
      <chose class="absolute left-[10%] h-full w-[90%] flex-col flex">
        <logo id="logo" class="mt-3 w-[36px] h-[36px] absolute left-[45%] -translate-x-[50%]">
          <Image width={36} height={36} src="/setting.svg" />
        </logo>
        <separator class="mt-[3.5rem] mb-1 h-[1px] w-[90%] bg-black" />
            <div onMouseDown$={() => {site.main = true; site.data = false;}}><Option state={name.main} nav={nav.hover} image={image.main} selected={site.main}   /></div>
            <div onMouseDown$={() => {site.data = true; site.main = false;}}><Option state={name.data} nav={nav.hover} image={image.data} selected={site.data}  /></div>
        </chose>
      </leftbar>

      <content class="flex absolute h-full ml-12 mt-8 w-full">
        <div class={`${showMain}`}> <ContentMain visible={site.main} /> </div>

        <div class={`${showData}`}> <ContentData /> </div>
      </content>
    </container>
    </>
  );

});

export const Option = component$((props: { state: string, nav: boolean, image: string, selected: boolean }) => {
  let option_class = "cursor-pointer relative left-[5%] pt-1 pb-1 border-b-2 border-white flex before:hover:bg-blue-500 before:bg-blue-500/0 before:duration-150 before:absolute before:w-[90%] hover:before:w-[95%] before:h-full before:-top-[1.5px] before:-left-[5%] before:rounded-xl";
  let Image_class = "textnav z-10 AnimationImageunhover";
  let p_class = "relative ml-1 left-[20%] -translate-x-1/3 translate-y-[10%] font-medium opacity-0 Animationnavunhover";

  if (!props.selected){
    Image_class = "textnav z-10 opacity-50 brightness-0";
  } else {
    option_class = "relative left-[5%] pt-1 pb-1 border-b-2 border-white flex";
  }
  
  if (props.nav) {
    if (props.selected) Image_class = "textnav z-10 brightness-0 opacity-80"
      p_class = "relative ml-1 left-[20%] -translate-x-1/3 translate-y-[10%] font-medium opacity-100";
  } else {
      p_class = "relative ml-1 left-[20%] -translate-x-1/3 translate-y-[10%] font-medium opacity-0 Animationnavunhover";
  }


  return (
    <>
    <div>
      <options class={option_class}>
        <Image class={Image_class} width={36} height={36} src={props.image} />
        <p class={p_class}>{props.state}</p>
      </options>
    </div>
    </>
  );
});

export const Switch = component$((props: { true: boolean, title: string, description: string, mousedown: boolean }) => {
  let button_class: string = `w-16 h-8 shadow-sm after:rounded-2xl after:left-0 after:top-0 after:w-full after:h-full after:absolute after:shadow-inner bg-gray-200 relative top-1/2 -translate-y-1/2 rounded-2xl
  before:w-6 before:h-6 transition-all duration-300 before:duration-300 before:transition-all before:absolute before:left-0 before:top-0 before:mt-1 before:ml-1 before:bg-white before:rounded-full before:shadow-md `;

  if (props.mousedown){
  if (props.true){
    button_class = button_class + `AnimationSwitchOn`;
  } else {
    button_class = button_class + `AnimationSwitchOff`;
  }
} else {
  if (props.true){
    button_class = button_class + `AnimationSwitchOnNon`;
  } else {
    button_class = button_class + `AnimationSwitchOffNon`;
  }
}

  return(
    <>
    <setting class='ml-4 w-[146vh] flex pb-4 pt-4 border-b'>
      <text class='flex flex-col h-full w-full'>
        <name class='font-bold text-2xl ml-2'>{props.title}</name>
        <description class='font-medium text-md ml-2'>{props.description}</description>
      </text>
      <buttonspace class='h-full w-16'>
        <button class={button_class} />
      </buttonspace>
    </setting>
    </>
  )
})

export const Click = component$((props: { title: string, description: string, wait: boolean, text: string }) => {
  let buttonshow = "block";
  let spinshow = "hidden"

  if (props.wait){
    buttonshow = "hidden";
    spinshow = "block"
  }
  
  return(
    <>
    <setting class='ml-4 w-[146vh] flex pb-4 pt-4 border-b'>
      <text class='flex flex-col h-full w-full'>
        <name class='font-bold text-2xl ml-2'>{props.title}</name>
        <description class='font-medium text-md ml-2'>{props.description}</description>
      </text>
      <buttonspace class='h-full'>
        <button class={`bg-gray-100 duration-200 hover:bg-blue-400 border-gray-200 border whitespace-nowrap px-2 h-8 relative top-1/2 -translate-y-1/2 rounded-xl font-medium ${buttonshow}`}><p>{props.text}</p></button>
        <Image src="/spinner.svg" width={42} height={42} class={`${spinshow} relative top-[15%] AnimtionOpening`} />
      </buttonspace>
    </setting>
    </>
  )
})

export const Slider = component$((props: { percentage: number, title: string, description: string }) => {

  return(
    <>
    <setting class='ml-4 w-[149vh] flex pb-4 pt-4 border-b'>
      <text class='flex flex-col h-full w-full'>
        <name class='font-bold text-2xl ml-2'>{props.title}</name>
        <description class='font-medium text-md ml-2'>{props.description}</description>
      </text>
      <buttonspace class='h-full w-48 flex flex-col mr-4'>
        <button style={`--left: ${props.percentage}%;`} class={`w-full h-3 top-1/2 -translate-y-1/2 bg-gray-200 shadow-inner relative rounded-2xl
  before:absolute before:duration-75 before:h-6 before:w-6 before:bg-blue-500 before:-translate-y-1/2 before:-translate-x-1/2 before:rounded-full before:shadow-md Slider`} />
        
      </buttonspace>
    </setting>
    </>
  )
})

export const Textbox = component$((props: { title: string, description: string }) => {
  return(
    <>
    <setting class='ml-4 w-[149vh] flex pb-4 pt-4 border-b'>
      <text class='flex flex-col h-full w-full'>
        <name class='font-bold text-2xl ml-2'>{props.title}</name>
        <description class='font-medium text-md ml-2'>{props.description}</description>
      </text>
    </setting>
    </>
  )
})