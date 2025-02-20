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
  
    const links = [
      { title: "About Us", url: "#" },
      { title: "Feedback", url: "#" },
      { title: "Trust, Safety & Security", url: "#" },
      { title: "Help & Support", url: "#" },
      { title: "Upwork Foundation", url: "#" },
      { title: "Terms of Service", url: "#" },
      { title: "Privacy Policy", url: "#" },
      { title: "CA Notice at Collection", url: "#" },
      { title: "Cookie Settings", url: "#" },
      { title: "Accessibility", url: "#" },
      { title: "Desktop App", url: "#" },
      { title: "Cookie Policy", url: "#" },
      { title: "Enterprise Solutions", url: "#" }
    ];
  </script>
  
  <footer class="footer">
    <div class="footer-links">
      {#each links as link, i}
        <a href={link.url} class="footer-link">{link.title}</a>
        {#if (i + 1) % 3 === 0}
          <br />
        {/if}
      {/each}
    </div>
  
    <div class="footer-social">
      <span>Follow Us</span>
      <a href="#" class="social-icon"><FacebookIcon width="24" height="24" /></a>
      <a href="#" class="social-icon"><LinkedInIcon width="24" height="24" /></a>
      <a href="#" class="social-icon"><XIcon width="24" height="24" /></a>
      <a href="#" class="social-icon"><YouTubeIcon width="24" height="24" /></a>
      <a href="#" class="social-icon"><InstagramIcon width="24" height="24" /></a>
    </div>
  
    <div class="footer-mobile">
      <span>Mobile app</span>
      <a href="#" class="mobile-icon"><AppleIcon width="24" height="24" /></a>
      <a href="#" class="mobile-icon"><AndroidIcon width="24" height="24" /></a>
    </div>
  
    <div class="footer-copy">
      © 2015 - {new Date().getFullYear()} YourCompany Inc.
    </div>
  </footer>
  
  <style>
    .footer {
      background: #111;
      color: #fff;
      text-align: center;
      padding: 20px 0;
      font-size: 14px;
    }
  
    .footer-links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 15px;
    }
  
    .footer-link {
      color: #ccc;
      text-decoration: none;
    }
  
    .footer-social,
    .footer-mobile {
      margin-top: 15px;
    }
  
    .social-icon,
    .mobile-icon {
      display: inline-block;
      margin: 0 8px;
    }
  
    .footer-copy {
      margin-top: 15px;
      font-size: 12px;
      color: #777;
    }
  </style>
  