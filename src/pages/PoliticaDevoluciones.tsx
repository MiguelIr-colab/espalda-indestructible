import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PoliticaDevoluciones = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background pt-24">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Política de Devolución</h1>

          <div className="prose prose-neutral max-w-none text-muted-foreground space-y-6">
            <p>
              El servicio tendrá vigencia mientras dure el servicio en cuestión hasta la efectiva finalización del mismo
              o hasta el desistimiento de alguna de las partes con las pertinentes consecuencias que ello conlleva.
            </p>

            <p>
              El programa tendrá fecha de comienzo el primer día de entrenamiento programado en su planificación, y no
              la fecha de su inscripción, de tal forma el tiempo que transcurra desde su inscripción hasta la fecha de
              comienzo de la planificación correrá por parte de la empresa.
            </p>

            <p>
              La duración del programa serán semanas consecutivas desde la fecha de inicio, sin pausas, ni
              aplazamientos ni por viajes, desplazamientos, trabajo, resfriados, consejos médicos o cualquier otra
              causa que no sea una cirugía mayor o que pusiera en riesgo la estabilidad hemodinámica del cliente, y la
              empresa reserva el derecho a decidir sobre esta cuestión, y en base a ello, las partes se obligan a
              cumplir con dicha duración y todas sus condiciones.
            </p>

            <p>
              La empresa no se responsabiliza por los posibles problemas causados por un mal uso del programa por
              parte del cliente, por problemas eventuales provenientes de la interrupción de los servicios, ni por la
              interrupción de los servicios en el caso de falta de energía eléctrica para el sistema de su proveedor
              de acceso, fallos en el sistema de transmisión o de navegación en el acceso a internet, incompatibilidad
              de los sistemas de los usuarios con los del proveedor de acceso o cualquier acción de terceros que
              impidan la prestación del servicio resultante de caso fortuito, imprevisibles o de fuerza mayor.
            </p>

            <p>
              Este servicio cuenta con una estricta política de no reembolso, al aceptar el contrato el cliente acepta
              que no existe ninguna posibilidad de reembolso por causas como desistimiento, abandono del programa por
              razones propias o cualquier causa ajena a UNBREAKABLE BACK LLC.
            </p>

            <p>
              Asimismo, el cliente también se verá obligado a abonar la totalidad del importe del programa si el mismo
              decide abandonar el programa antes del tiempo contratado y no finalizar el programa en cuestión.
            </p>

            <p>
              Se acuerda por las partes que si el cliente decidiera abandonar o desistir del programa quedará
              igualmente obligado a abonar la totalidad del mismo, siempre y cuando dicho desistimiento no sea dentro
              de los primeros 14 días naturales desde la inscripción al programa.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PoliticaDevoluciones;
