/**
 * Os papéis do fornecedor de uma empresa, por ECR, embaixo dos critérios da
 * qualificação de material (CTO-D811 §2, D812 §2): o que a revisão vigente da
 * ECR pede, ao lado do que está guardado. Cada papel com o alcance, a data e
 * quem conferiu; as correções embaixo dele. O comprador vê o que falta, anexa
 * e corrige.
 */

import { useEffect, useState } from 'react';
import { Button } from '../../components/Button/Button';
import { Icon } from '../../components/Icon/Icon';
import { blocosDaSecao, linhaDoDocumento } from '../../domain/ecr';
import { chaveDaEmpresa } from '../../domain/fornecedores';
import { itensDoRegistro } from '../../domain/qualidadeNaOc';
import {
  avisoDaEcr,
  quemConferiu,
  registrosDaEcr,
  textoDaCorrecao,
  textoDaVigencia,
  vigenciaDoRegistro,
  type RegistroGuardado,
} from '../../domain/registrosGuardados';
import type { Ecr, Fornecedor } from '../../domain/types';
import { useHojeEmSaoPaulo } from '../../hooks/useHojeEmSaoPaulo';
import { lerLinksDasFotos } from '../../services/supabase/recebimento';
import { useRegistrosStore } from '../../stores/useRegistrosStore';
import { AnexarPapelDialogo, CorrigirAlcanceDialogo } from './DialogosDoRegistro';
import styles from './RegistrosDaEmpresa.module.css';

const rotuloDaEcr = (ecrs: readonly Ecr[], id: number) => {
  const e = ecrs.find((x) => x.id === id);
  return e ? `${e.codigo} — ${e.nome}` : `ECR ${id}`;
};

/** O que a revisão vigente pede, como está na ECR. */
function OQueAEcrPede({ ecr }: { ecr: Ecr | undefined }) {
  const linhas = ecr?.secoes ? itensDoRegistro(ecr.secoes) : null;
  if (!linhas || linhas.length === 0) return <p className={styles.vazio}>O texto desta ECR não tem a lista no sistema.</p>;
  return (
    <>
      {blocosDaSecao(linhas).map((b, i) =>
        b.tipo === 'lista' ? (
          <ul key={i} className={styles.pede}>
            {b.itens.map((it, j) => (
              <li key={j}>{linhaDoDocumento(it)}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className={styles.nota}>{linhaDoDocumento(b.item)}</p>
        ),
      )}
    </>
  );
}

export function RegistrosDaEmpresa({
  chave, nome, ecrIds, filial, ecrs, fornecedores, podeEmitir,
}: {
  /** A chave da empresa na tela (`chaveDaEmpresa`). */
  chave: string;
  nome: string;
  /** As ECRs da qualificação que vale. */
  ecrIds: readonly number[];
  /** A filial que guarda pela empresa; `null` fora do cadastro (aí não anexa). */
  filial: Fornecedor | null;
  ecrs: readonly Ecr[];
  fornecedores: readonly Fornecedor[];
  podeEmitir: boolean;
}) {
  const dados = useRegistrosStore((s) => s.dados);
  const erro = useRegistrosStore((s) => s.erro);
  const carregar = useRegistrosStore((s) => s.carregar);
  const hoje = useHojeEmSaoPaulo();
  const [anexando, setAnexando] = useState<number | null>(null);
  const [corrigindo, setCorrigindo] = useState<RegistroGuardado | null>(null);
  const [links, setLinks] = useState<Map<string, string>>(new Map());

  const chavePorFornecedor = new Map(fornecedores.map((f) => [f.id, chaveDaEmpresa(f)]));
  const daEcr = (id: number) =>
    dados ? registrosDaEcr(dados.registros, chave, id, (f) => chavePorFornecedor.get(f), hoje) : [];
  const documentos = ecrIds.flatMap((id) => daEcr(id).map((r) => r.documentoId)).join(',');

  useEffect(() => {
    void carregar();
  }, [carregar]);
  useEffect(() => {
    let vivo = true;
    void lerLinksDasFotos(documentos ? documentos.split(',') : []).then((m) => vivo && setLinks(m));
    return () => {
      vivo = false;
    };
  }, [documentos]);

  if (ecrIds.length === 0) return null;
  return (
    <div className={styles.registros} data-registros-de={chave}>
      <h4 className={styles.titulo}>Papéis do fornecedor, por ECR</h4>
      {erro && (
        <div className={styles.erro} role="alert">
          Não consegui ler os papéis guardados: {erro}{' '}
          {/* A falha não se cura sozinha: sem isto, só recarregando a página (CTO-D818 §2). */}
          <Button variant="outline" size="sm" onClick={() => void carregar(true)}>
            Tentar de novo
          </Button>
        </div>
      )}
      {ecrIds.map((id) => {
        const ecr = ecrs.find((e) => e.id === id);
        const papeis = daEcr(id);
        const marca = dados?.marcas.find((m) => m.ecrId === id);
        const itens = ecr?.secoes ? itensDoRegistro(ecr.secoes) : null;
        const aviso = dados ? avisoDaEcr(papeis, hoje, { itens, temMarca: !!marca }) : '';
        return (
          <section key={id} className={styles.ecr} data-registros-da-ecr={id}>
            <h5>{rotuloDaEcr(ecrs, id)}</h5>
            {marca && (
              <p className={styles.marca} data-a-cada-entrega="">
                Pede o papel a cada entrega: {marca.porque}
              </p>
            )}
            <div className={styles.lados}>
              <div>
                <h6>O que a ECR pede{ecr?.revisao ? ` (Rev. ${ecr.revisao})` : ''}</h6>
                <OQueAEcrPede ecr={ecr} />
              </div>
              <div>
                <h6>O que está guardado</h6>
                {!dados && !erro && <p className={styles.vazio}>Lendo os papéis…</p>}
                {aviso && <p className={styles.aviso} data-aviso-da-ecr="">{aviso}</p>}
                {papeis.length > 0 && (
                  <ul className={styles.guardados}>
                    {papeis.map((r) => (
                      <li key={r.id} data-registro={r.id} data-vigencia={vigenciaDoRegistro(r, hoje)}>
                        <div className={styles.linhaDoPapel}>
                          <strong>{textoDaVigencia(r, hoje)}</strong>
                          {links.get(r.documentoId) && (
                            <a href={links.get(r.documentoId)} target="_blank" rel="noreferrer" className={styles.abrir}>
                              <Icon name="eye" size={14} /> Abrir
                            </a>
                          )}
                          {podeEmitir && (
                            <Button variant="ghost" size="sm" onClick={() => setCorrigindo(r)}>
                              Corrigir
                            </Button>
                          )}
                        </div>
                        <div className={styles.quem}>{quemConferiu(r)}</div>
                        {r.correcoes.map((c, i) => (
                          <div key={i} className={styles.correcao} data-correcao="">
                            {textoDaCorrecao(c)}
                          </div>
                        ))}
                      </li>
                    ))}
                  </ul>
                )}
                {podeEmitir && filial && (
                  <Button variant="outline" size="sm" onClick={() => setAnexando(id)}>
                    <Icon name="upload" size={14} />
                    Anexar papel
                  </Button>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {anexando !== null && filial && (
        <AnexarPapelDialogo
          quem={nome}
          naOc={false}
          ecrs={[{ id: anexando, rotulo: rotuloDaEcr(ecrs, anexando) }]}
          onde={() => ({ fornecedorId: filial.id })}
          aoFechar={() => setAnexando(null)}
          aoGuardar={() => void carregar(true)}
        />
      )}
      {corrigindo && (
        <CorrigirAlcanceDialogo
          registro={corrigindo}
          ecr={`${nome} · ${rotuloDaEcr(ecrs, corrigindo.ecrId)}`}
          hoje={hoje}
          aoFechar={() => setCorrigindo(null)}
          aoCorrigir={() => void carregar(true)}
        />
      )}
    </div>
  );
}
