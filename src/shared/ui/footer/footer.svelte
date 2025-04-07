<script lang="ts">
  import {
    LinkedInIcon,
    XIcon,
    YouTubeIcon,
    InstagramIcon,
    AppleIcon,
    AndroidIcon,
    FacebookIcon
  } from "$lib/shared/ui/icons";

  const brandLinks = [
    { title: "About Us", url: "#" },
    { title: "Feedback", url: "#" },
    { title: "Trust, Safety & Security", url: "#" }
  ];

  const helpLinks = [
    { title: "Help & Support", url: "#" },
    { title: "Terms of Service", url: "#" },
    { title: "Privacy Policy", url: "#" }
  ];

  const docsLinks = [
    { title: "CA Notice at Collection", url: "#" },
    { title: "Cookie Settings", url: "#" },
    { title: "Cookie Policy", url: "#" }
  ];
</script>

<footer class="flex justify-between footer p-10 bg-gray-900 text-gray-300">
  <!-- Первая колонка: бренд и основные ссылки -->
  <div>
    <span class="footer-title text-white">FlsurfIz</span> 
    {#each brandLinks as link}
      <a href={link.url} class="link link-hover">{link.title}</a>
    {/each}
    <p class="mt-4 text-sm text-gray-500">© 2015 - {new Date().getFullYear()} FlsurfIz Inc.</p>
  </div> 

  <!-- Вторая колонка: Помощь -->
  <div>
    <span class="footer-title text-white">Помощь</span> 
    {#each helpLinks as link}
      <a href={link.url} class="link link-hover">{link.title}</a>
    {/each}
  </div> 

  <!-- Третья колонка: Документы -->
  <div>
    <span class="footer-title text-white">Документы</span> 
    {#each docsLinks as link}
      <a href={link.url} class="link link-hover">{link.title}</a>
    {/each}
  </div> 

  <!-- Четвертая колонка: Социальные сети и мобильные приложения -->
  <div>
    <span class="footer-title text-white">Мы в соц сетях</span> 
    <div class="grid grid-flow-col gap-4 mt-2">
      <a href="/" class="hover:text-white"><FacebookIcon width="24" height="24" /></a>
      <a href="/" class="hover:text-white"><LinkedInIcon width="24" height="24" /></a>
      <a href="/" class="hover:text-white"><XIcon width="24" height="24" /></a>
      <a href="/" class="hover:text-white"><YouTubeIcon width="24" height="24" /></a>
      <a href="/" class="hover:text-white"><InstagramIcon width="24" height="24" /></a>
    </div>
    <span class="footer-title text-white mt-4">Mobile App</span>
    <div class="grid grid-flow-col gap-4 mt-2">
      <a href="/" class="hover:text-white"><AppleIcon width="24" height="24" /></a>
      <a href="/" class="hover:text-white"><AndroidIcon width="24" height="24" /></a>
    </div>
  </div>
</footer>
