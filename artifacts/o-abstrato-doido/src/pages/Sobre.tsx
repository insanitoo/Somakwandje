import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import artistPng from "@assets/00e79b8a-e616-4d9a-a14d-930bfb0bffb1_1788518663426.jpeg";

export default function Sobre() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="py-14 md:py-20 bg-[hsl(40,43%,96%)]">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 md:gap-16 items-start">
            <div>
              <img
                src={artistPng}
                alt="Dioleny Intya no atelier"
                className="w-full aspect-[4/5] object-cover"
                data-testid="img-artist-sobre"
              />
            </div>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                O Abstrato Doido - Dioleny Intya - é um artista plástico angolano cuja prática se desenvolve através da abstração como forma de investigar as contradições da condição humana, a espiritualidade e as escolhas que moldam quem somos. As suas obras não procuram oferecer respostas, mas criar um espaço onde o espectador possa confrontar as próprias perguntas.
              </p>
              <p>
                Embora tenha iniciado a sua carreira profissional a poucos anos, a sua relação com a abstração começou muito antes, literalmente aos 6 anos. Cresceu no Lubango, no sul de Angola, longe dos grandes centros culturais e sem conhecer um único artista plástico. Ainda criança, enchia cadernos de rascunhos, fascinava-se por formas distorcidas, rachaduras nas paredes e imagens que sugeriam mais do que explicavam. Só anos mais tarde percebeu que aquela linguagem já tinha um nome. A abstração nunca foi uma escolha consciente. Foi a forma como sempre viu o mundo.
              </p>
              <p>
                Depois de iniciar a sua produção artística, decidiu deixar a cidade onde vivia e mudar-se para Luanda para dedicar-se integralmente à construção de uma carreira de longo prazo. Desde então, participou em diversas exposições coletivas, integrou duas edições da Luanda Feira de Arte, o principal evento de arte contemporânea de Angola, e apresentou a sua primeira exposição individual em formato digital, criada de forma independente quando ainda não encontrava espaço nas galerias tradicionais. As suas obras integram coleções particulares em países como Angola, Portugal, Brasil, Espanha, Moçambique e África do Sul.
              </p>
              <p>
                A exposição O Jardim de Barrabás, a sua primeira individual presencial em galeria, marca um novo momento da sua trajetória e o início público de uma investigação artística que pretende desenvolver ao longo das próximas décadas. Para Dioleny, cada obra é um capítulo de uma mesma pesquisa. Não sobre aquilo que sabemos a respeito de nós mesmos, mas sobre o instante em que percebemos que somos muito mais contraditórios do que imaginávamos.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}