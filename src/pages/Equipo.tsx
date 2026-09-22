import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import teamRoberto from "@/assets/team-roberto.png";
import teamMaria from "@/assets/team-maria.png";
import teamHugo from "@/assets/team-hugo.png";
import teamKevin from "@/assets/team-kevin.png";

const Equipo = () => {
  const teamMembers = [{
    name: "Roberto Galván",
    role: "Ldo Ciencias de la Actividad Física",
    description: "Experto en readaptación de patologías de columna. Experto en neuromecánica. Biomecánica deportiva.",
    specialties: ["Hernia Discal", "Estenosis Lumbar", "Protusión Discal"],
    image: teamRoberto
  }, {
    name: "Asun Venancio",
    role: "Fisioterapeuta Colegiada: 39/1156",
    description: "Master en Neurorehabilitación.",
    specialties: ["Ejercicio terapéutico", "Dolor Neuropático"],
    image: teamMaria
  }, {
    name: "Kevin Díaz",
    role: "Fisioterapeuta colegiado 10944",
    description: "Investigador clínico. Master en Fisioterapia del sistema músculo esquelético.",
    specialties: ["Investigación", "Patologías de columna"],
    image: teamKevin
  }, {
    name: "Hugo Fondevilla",
    role: "Fisioterapeuta colegiado: 1998 COFISPA",
    description: "Master en Fisioterapia Neurológica.",
    specialties: ["Ejercicio Terapéutico", "Dolor Neuropático"],
    image: teamHugo
  }];
  return <div className="min-h-screen bg-[hsl(var(--light-gray))]">
      <Helmet>
        <title>Nuestro Equipo - Espalda Indestructible</title>
        <meta name="description" content="Conoce al equipo de profesionales especializados en patologías de columna y dolor neuropático de Espalda Indestructible." />
        <link rel="canonical" href="https://espaldaindestructible.com/equipo" />
      </Helmet>
      <Header />
      <main className="pt-20">
        <section className="py-20 bg-[hsl(var(--light-gray))]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-secondary-foreground">
                Nuestro Equipo
              </h1>
              <p className="text-xl text-secondary-foreground/70 max-w-3xl mx-auto">
                Profesionales especializados en patologías de columna y dolor neuropático.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {teamMembers.map((member, index) => <Card key={index} className="bg-background border-border p-6 flex flex-col">
                  <div className="text-center mb-6">
                    <div className="w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full">
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      {member.name}
                    </h2>
                    <p className="text-primary font-semibold text-sm mb-3">
                      {member.role}
                    </p>
                  </div>

                  <p className="text-muted-foreground text-sm mb-6 text-center flex-grow">
                    {member.description}
                  </p>

                  <div className="border-t border-border pt-6">
                    <h3 className="text-sm font-bold text-foreground mb-3 text-center">
                      Especialidades
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {member.specialties.map((specialty, i) => <span key={i} className="bg-primary text-primary-foreground px-3 py-1 rounded-md font-semibold text-xs">
                          {specialty}
                        </span>)}
                    </div>
                  </div>

                  
                </Card>)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
export default Equipo;
