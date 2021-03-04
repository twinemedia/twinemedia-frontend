<template>
   <div class="time-input input-style">
        <input :disabled="disabled" @input="updateValue()" type="number" v-model="hour" :min="minDate ? minDate.getHours() : 0" :max="maxDate ? maxDate.getHours() : 24">
        :
        <input :disabled="disabled" @input="updateValue()" type="number" v-model="minute" :min="minDate ? minDate.getMinutes() : 0" :max="maxDate ? maxDate.getMinutes() : 59">
        on
        <input :disabled="disabled" @input="updateValue()" type="number" v-model="day" :min="minDate ? minDate.getDate() : 1" :max="maxDate ? maxDate.getDate() : 31">
        of
        <select :disabled="disabled" @input="updateValue()" v-model="month" class="month-dropdown">
            <template v-for="(month, i) in monthNames">
                <template v-if="(!minDate || i >= minDate.getMonth()) && (!maxDate || i <= maxDate.getMonth())">
                    <option :key="i" :value="i">{{ month }}</option>
                </template>
            </template>
        </select>
        ,
        <input :disabled="disabled" @input="updateValue()" style="width: 55px" type="number" v-model="year" :min="minDate ? minDate.getFullYear() : 1980" :max="maxDate ? maxDate.getFullYear() : 2100">
    </div>
</template>

<style scoped>
.time-input {
    display: inline-block;
}
input[type="number"] {
    background: none;
    border: none;
    width: 34px;
}
</style>

<script>
export default {
    name: 'TimeInput',
    props: ['value', 'disabled', 'min', 'max'],
    data() {
        var date = this.stringOrNumberToDateOrNull(this.value)

        // Use current time if value is null
        if(date == null)
            date = new Date()

        return {
            date,
            hour: this.formatNumber(date.getHours()),
            minute: this.formatNumber(date.getMinutes()),
            day: this.formatNumber(date.getDate()),
            month: date.getMonth(),
            year: date.getFullYear(),
            minDate: this.stringOrNumberToDateOrNull(this.min),
            maxDate: this.stringOrNumberToDateOrNull(this.max),

            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        }
    },
    methods: {
        stringOrNumberToDateOrNull(strOrNum) {
            if(strOrNum == null || strOrNum == undefined)
                return null
            else
                return new Date(isNaN(strOrNum) ? strOrNum : strOrNum*1)
        },
        formatNumber(num) {
            return (num+'').length < 2 ? '0'+num : num+''
        },
        updateValue() {
            // Edit date
            this.date.setHours(this.hour*1)
            this.date.setMinutes(this.minute*1)
            this.date.setDate(this.day*1)
            this.date.setMonth(this.month*1)
            this.date.setFullYear(this.year*1)

            // Format inputs
            this.hour = this.formatNumber(this.hour)
            this.minute = this.formatNumber(this.minute)
            this.day = this.formatNumber(this.day)

            this.$emit('input', this.date.toISOString())
        }
    }
}
</script>