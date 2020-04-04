export function formatarMoeda(valor) {
	if(valor.indexOf('.') <= 0 && valor.indexOf(',') <= 0){
		valor += '00';
	}
	var v = valor.replace(/\D/g,'');
	v = (v/100).toFixed(2) + '';
	v = v.replace(".", ",");
	v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
	v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
	return v;
}

export function parseDecimal(valor){
    return parseFloat(valor.replace('.','').replace(',', '.'))
}