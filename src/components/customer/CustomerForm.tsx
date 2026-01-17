import React from "react";
import { useCustomerStore } from "@/store/customerStore";
import { cn } from "@/lib/cn";

export function CustomerForm() {
    const {
        name, phone, deliveryMethod, address, neighborhood, consentToSave,
        setField, setConsent
    } = useCustomerStore();

    return (
        <div className="space-y-4 rounded-xl border border-ink/10 bg-paper2/50 p-4">
            <h3 className="font-serif text-lg font-bold text-olive">Seus Dados</h3>

            {/* Nome & WhatsApp */}
            <div className="grid grid-cols-1 gap-3">
                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-ink/50">Nome</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setField("name", e.target.value)}
                        placeholder="Seu nome"
                        className="w-full h-[52px] rounded-md border border-ink/20 bg-paper px-3 text-sm text-ink outline-none focus:border-olive touch-target"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-ink/50">WhatsApp</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setField("phone", e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="w-full h-[52px] rounded-md border border-ink/20 bg-paper px-3 text-sm text-ink outline-none focus:border-olive touch-target"
                    />
                </div>
            </div>

            {/* Delivery Method Toggle */}
            <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink/50">Método</label>
                <div className="mt-1 flex gap-2">
                    <button
                        onClick={() => setField("deliveryMethod", "delivery")}
                        className={cn(
                            "flex-1 h-[48px] rounded-md text-sm font-bold transition-colors touch-target",
                            deliveryMethod === "delivery" ? "bg-olive text-paper shadow-sm" : "bg-paper border border-ink/10 text-ink/60 hover:bg-paper2"
                        )}
                    >
                        Entrega
                    </button>
                    <button
                        onClick={() => setField("deliveryMethod", "pickup")}
                        className={cn(
                            "flex-1 h-[48px] rounded-md text-sm font-bold transition-colors touch-target",
                            deliveryMethod === "pickup" ? "bg-olive text-paper shadow-sm" : "bg-paper border border-ink/10 text-ink/60 hover:bg-paper2"
                        )}
                    >
                        Retirada
                    </button>
                </div>
            </div>

            {/* Address fields (Only if delivery) */}
            {deliveryMethod === "delivery" && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="mb-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-ink/50">Bairro</label>
                        <input
                            type="text"
                            value={neighborhood}
                            onChange={(e) => setField("neighborhood", e.target.value)}
                            placeholder="Ex: Centro"
                            className="w-full h-[52px] rounded-md border border-ink/20 bg-paper px-3 text-sm text-ink outline-none focus:border-olive touch-target"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-ink/50">Endereço Completo</label>
                        <textarea
                            value={address}
                            onChange={(e) => setField("address", e.target.value)}
                            placeholder="Rua, Número, Complemento"
                            rows={2}
                            className="w-full resize-none rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-olive"
                        />
                    </div>
                </div>
            )}

            {/* LGPD Consent */}
            <div className="flex items-start gap-2 pt-2">
                <input
                    type="checkbox"
                    id="consent"
                    checked={consentToSave}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-ink/30 text-olive focus:ring-olive"
                />
                <label htmlFor="consent" className="text-[12px] text-ink2/80 leading-tight cursor-pointer">
                    Autorizo salvar meus dados neste dispositivo para agilizar meus próximos pedidos. <a href="/contato" target="_blank" className="underline decoration-amber">Política de Privacidade</a>.
                </label>
            </div>
        </div>
    );
}
