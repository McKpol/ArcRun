import { component$, useStore } from '@builder.io/qwik';
import { Click } from '..'; 
import { invoke } from '@tauri-apps/api';

interface Wait{
  cache_programs: boolean;
  reset_settings: boolean;
}

export const ContentData = component$(() => {
  const wait = useStore<Wait>({
    cache_programs: false,
    reset_settings: false
  });


  return (
  <>
    <settings class='flex flex-col overflow-scroll pb-12 select-none'>
      <click class="flex flex-col" onMouseDown$={async () => {wait.cache_programs = true; await invoke("cache_programs_tauri"); wait.cache_programs = false;}}>
        <Click title="Redo cache" description='Redo cache of path files (it might took some time)' wait={wait.cache_programs} text="Redo cache" />
      </click>

      <click class="flex flex-col" onMouseDown$={async () => {wait.reset_settings = true; await invoke("reset_settings_tauri"); wait.reset_settings = false;}}>
        <Click title="Set to deafult" description='Reset settings to deafult' wait={wait.reset_settings} text="Reset to deafult" />
      </click>
    </settings>
  </>
  )
});