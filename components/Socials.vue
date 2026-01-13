<template lang="pug">
  ul.socials-grid
    li
      a(href="https://www.facebook.com/profile.php?id=61559622346848" target="_blank")
        img(src="/img/socials/facebook.svg", alt="Facebook")
    li
      a(href="https://twitter.com/gasebackff" target="_blank")
        img(src="/img/socials/x.svg" alt="X feed for Gåsebäck Film Festival")
    li
      a(href="https://www.instagram.com/gasebackfilmfestival/" target="_blank")
        img(src="/img/socials/instagram.svg" alt="Instagram feed for Gåsebäck Film Festival")
    //- li
      a(href="#" target="_blank")
        img(src="/img/socials/tt.svg", alt="Tik Tok")
    
</template>

<style>
ul.socials-grid {
  background-color: rgba(0, 0, 0, .5);
  padding: .5rem 1rem;
  border-radius: 1rem;
  list-style: none;

  li {
    list-style: none;
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
}
</style>