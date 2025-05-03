import { writable } from "svelte/store";

export function loadTheme() { 
    if (localStorage.getItem('theme') !== null) { 
        let theme = localStorage.getItem('theme')
        
        if (theme === 'dark' || theme === 'light') { 
            CurrentTheme.set(theme)
        }
    }
}

export function setTheme(theme: "dark" | "light") { 
    localStorage.setItem('theme', theme)
    CurrentTheme.set(theme)
}

export let CurrentTheme = writable<"dark" | "light">("dark")
