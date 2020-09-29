<template>
<div>
  <div>
    <Hero 
    imgSrc= "livewire.png"
    title="Be our Muse." subtitle="Inspire neurotechnology design." 
    description=''
    button1_text="Learn More" button1_href="/about"
    button2_text="See our Blog" button2_href="https://blog.mousaineuro.com/"
    align="center"/>
  </div>
  <div>
    <Hero 
    imgSrc="muse_pink.png"
    title="Our Next Invocation." 
    subtitle="Livewire: A Stimulating Night of Neurotechnology"
    description="Experience a social neurotechnology platform that enables you to manage your brain 
    data and couple with other minds across social, cultural, and political boundaries."
    button1_text="See the Agenda" button1_href="/projects"
    button2_text="Join the Brainstorm" button2_href="https://app.mousaineuro.com/"
    align="left"/>
  </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Hero from '@/components/Hero.vue'

export default {
  name: 'Home',
  components: {
    Hero
  }
}
</script>
