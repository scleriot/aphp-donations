export function statusLabel(status) {
    switch(status) {
        case "pledg": return "Promesse"
        case "received": return "Réceptionné APHP"
        case "distributed": return "Distribué"
    }
}

export function statusUsageLabel(status) {
    switch(status) {
        case "tobeprocessed": return "À traiter"
        case "processing": return "Traitement en cours"
        case "processed": return "Traité"
    }
}
