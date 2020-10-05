<template>
<div>
  <div>
    <Hero 
    imgSrc= "interaction.jpg"
    title="Inspire Neurotechnology Design"
    subtitle="We empower user feedback through interactive media"
    button1_text="Learn More" button1_href="/about"
    button2_text="Contribute" button2_href="/contribute"
    align="left"/>
  </div>
  <div>
    <Hero 
    imgSrc="brain.gif"
    title="Next Invocation"
    subtitle="Livewire: A Stimulating Night of Neurotechnology"
    description="Experience a social neurotechnology platform that enables you to manage your brain 
    data and couple with other minds across social, cultural, and political boundaries."
    button1_text="See the Agenda" button1_href="/projects"
    button2_text="Join the Brainstorm" button2_href="/brainstorm"
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
