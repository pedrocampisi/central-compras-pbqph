/**
 * Aba Configurações — SOMENTE LEITURA nesta versão.
 *
 * A camada de dados ainda não grava configurações (condições de pagamento,
 * textos legais) no banco — e uma tela que aceita edição e perde
 * tudo no reload é pior do que uma que não deixa editar. Até a gravação ser
 * ligada, os controles ficam desabilitados e a tela diz o porquê.
 *
 * Os backups locais por pasta também saíram de cena: os dados agora vivem no
 * banco (Supabase), cujo backup é responsabilidade do servidor, não de uma
 * pasta no computador de cada um.
 */

import { useDataStore } from '../../stores/useDataStore';
import { FieldGroup } from '../../components/FieldGroup/FieldGroup';
import { Field } from '../../components/Field/Field';
import { Button } from '../../components/Button/Button';
import { AvisoSomenteLeitura } from '../../components/AvisoSomenteLeitura/AvisoSomenteLeitura';
import styles from './ConfigPage.module.css';

export function ConfigPage() {
  const data = useDataStore((s) => s.data);

  if (!data) return null;

  const cfg = data.config;

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2>Configurações</h2>
          <p className="section-sub">Textos legais e integração com IA.</p>
        </div>
      </div>

      <AvisoSomenteLeitura oQue="as configurações" />

      {/* ── Destinatário da nota ───────────────────────────────────────────── */}
      <FieldGroup title="Destinatário da nota">
        <p className={styles.hint}>
          Quem recebe a nota fiscal de cada OC é o destinatário cadastrado na
          obra, no Central — a OC lê e fotografa na emissão. A lista de
          emitentes desta tela saiu em 15/09/2026; não há o que configurar aqui.
        </p>
      </FieldGroup>

      {/* ── Integração IA ─────────────────────────────────────────────────── */}
      <FieldGroup title="Importação de Pedidos por IA">
        <p className={styles.hint}>
          A leitura de pedidos por IA agora roda no servidor, com a chave
          guardada lá — nenhuma configuração é necessária neste computador.
        </p>
      </FieldGroup>

      {/* ── Condições de pagamento ────────────────────────────────────────── */}
      <FieldGroup title="Condições de Pagamento">
        <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {cfg.condicoes_pagamento.map((c) => (
            <div key={c} className={styles.condicaoChip}>
              <span>{c}</span>
            </div>
          ))}
          {cfg.condicoes_pagamento.length === 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nenhuma condição cadastrada.</span>
          )}
        </div>
        <div className={styles.rowFull}>
          <input
            className={styles.textInput}
            placeholder="Ex: 30/60/90 dias"
            disabled
            title="A camada de dados ainda não grava condições — edição virá numa próxima etapa"
          />
          <Button
            variant="outline"
            size="sm"
            disabled
            title="A camada de dados ainda não grava condições — edição virá numa próxima etapa"
          >
            Adicionar
          </Button>
        </div>
      </FieldGroup>

      {/* ── Textos legais ─────────────────────────────────────────────────── */}
      <fieldset disabled className="fieldset-reset">
        <FieldGroup title="Textos Legais">
          <Field
            as="textarea"
            label="Condições de Contratação"
            span2
            rows={4}
            value={cfg.texto_condicoes_contratacao}
            readOnly
          />
          <Field
            as="textarea"
            label="Instrução para Envio de NF"
            span2
            rows={3}
            value={cfg.texto_envio_nf}
            readOnly
          />
          <Field
            as="textarea"
            label="Requisito de Qualidade"
            span2
            rows={3}
            value={cfg.texto_qualidade}
            readOnly
          />
        </FieldGroup>
      </fieldset>

      {/* ── Backups ───────────────────────────────────────────────────────── */}
      <FieldGroup title="Backups">
        <p className={styles.hint}>
          Os dados agora ficam no banco (Supabase). O backup é feito no
          servidor — a antiga pasta de backups locais deixou de ser usada
          nesta versão.
        </p>
      </FieldGroup>
    </div>
  );
}
